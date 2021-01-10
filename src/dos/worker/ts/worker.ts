import { CommandInterface } from "../../../emulators";
import { WorkerClient, WorkerHost, FrameLine } from "./worker-client";

import { WasmModule } from "../../../impl/modules";
import { CommandInterfaceEventsImpl } from "../../../impl/ci-impl";
import { DosConfig } from "../../bundle/dos-conf";

export default function DosWorker(workerUrl: string,
                                  wasm: WasmModule,
                                  bundle: Uint8Array): Promise<CommandInterface> {
    return new Promise<CommandInterface>((resolve, reject) => {
        try {
            new WorkerCommandInterface(workerUrl,
                                       wasm,
                                       bundle,
                                       (ci, error) => {
                                           if (error !== undefined) {
                                               ci.exit()
                                                   .then(() => reject(error))
                                                   .catch(reject);
                                           } else {
                                               resolve(ci);
                                           }
                                       });
        } catch (e) {
            reject(e);
        }
    });
}

class WorkerCommandInterface implements CommandInterface, WorkerHost {

    private startedAt = Date.now();
    private frameWidth: number = 0;
    private frameHeight: number = 0;
    private rgba: Uint8Array = new Uint8Array();
    private client: WorkerClient;

    private persistPromise?: Promise<Uint8Array>;
    private persistResolve?: (bundle: Uint8Array) => void;

    private exitPromise?: Promise<void>;
    private exitResolve?: () => void;

    private eventsImpl = new CommandInterfaceEventsImpl();

    private freq = 0;

    private configPromise: Promise<DosConfig>;
    private configResolve: (config: DosConfig) => void = () => {/**/};
    private startupErrorLog: string | undefined = "";

    constructor(workerUrl: string,
                wasmModule: WasmModule,
                bundle: Uint8Array,
                ready: (ci: CommandInterface, err?: Error) => void) {
        this.configPromise = new Promise<DosConfig>((resolve) => this.configResolve = resolve);
        this.client = new WorkerClient(workerUrl,
                                       wasmModule,
                                       bundle,
                                       this,
                                       () => {
                                           if ((this.startupErrorLog || "").length > 0) {
                                               ready(this, new Error(this.startupErrorLog));
                                           } else {
                                               delete this.startupErrorLog;
                                               ready(this);
                                           }
                                       });
    }

    onConfig(config: DosConfig) {
        this.configResolve(config);
    }

    onFrameSize(width: number, height: number) {
        if (this.frameWidth === width && this.frameHeight === height) {
            return;
        }

        this.frameWidth = width;
        this.frameHeight = height;
        this.rgba = new Uint8Array(width * height * 4);
        this.eventsImpl.fireFrameSize(width, height);
    }

    onFrameLines(lines: FrameLine[]) {
        for (const line of lines) {
            this.rgba.set(line.heapu8, line.start * this.frameWidth * 4);
        }
        this.eventsImpl.fireFrame(this.rgba);
    }

    onSoundInit(freq: number) {
        this.freq = freq;
    }

    onSoundPush(samples: Float32Array) {
        this.eventsImpl.fireSoundPush(samples);
    }

    onPersist(bundle: Uint8Array) {
        if (this.persistResolve) {
            this.persistResolve(bundle);
            delete this.persistPromise;
            delete this.persistResolve;
        }
    }

    onLog(...args: any[]) {
        this.eventsImpl.fireMessage("log", ...args);
    }

    onWarn(...args: any[]) {
        this.eventsImpl.fireMessage("warn", ...args);
    }

    onErr(...args: any[]) {
        this.eventsImpl.fireMessage("error", ...args);
        if (this.startupErrorLog !== undefined) {
            this.startupErrorLog += JSON.stringify(args) + "\n";
        }
    }

    onStdout(message: string) {
        this.eventsImpl.fireStdout(message);
    }

    onExit() {
        if (this.exitResolve) {
            this.exitResolve();
            delete this.exitPromise;
            delete this.exitResolve;
        }
    }

    config() {
        return this.configPromise;
    }

    width() {
        return this.frameWidth;
    }

    height() {
        return this.frameHeight;
    }

    soundFrequency() {
        return this.freq;
    }

    screenshot(): Promise<ImageData> {
        const rgba = new Uint8ClampedArray(this.rgba.buffer);

        for (let next = 3; next < rgba.byteLength; next = next + 4) {
            this.rgba[next] = 255;
        }

        return Promise.resolve(new ImageData(rgba, this.frameWidth, this.frameHeight));
    }

    public simulateKeyPress(...keyCodes: number[]) {
        const timeMs = Date.now() - this.startedAt;
        keyCodes.forEach(keyCode => this.addKey(keyCode, true, timeMs));
        keyCodes.forEach(keyCode => this.addKey(keyCode, false, timeMs + 16));
    }

    public sendKeyEvent(keyCode: number, pressed: boolean) {
        this.addKey(keyCode, pressed, Date.now() - this.startedAt);
    }

    // public for test
    public addKey(keyCode: number, pressed: boolean, timeMs: number) {
        this.client.addKey(keyCode, pressed, timeMs);
    }

    sendMouseMotion(x: number, y: number) {
        this.client.sendMouseMotion(x, y, Date.now() - this.startedAt);
    }

    sendMouseButton(button: number, pressed: boolean) {
        this.client.sendMouseButton(button, pressed, Date.now() - this.startedAt);
    }

    public persist(): Promise<Uint8Array> {
        if (this.persistPromise !== undefined) {
            return this.persistPromise;
        }

        this.persistPromise = new Promise<Uint8Array>((resolve) => this.persistResolve = resolve);
        this.client.persist();

        return this.persistPromise;
    }

    public exit(): Promise<void> {
        if (this.exitPromise !== undefined) {
            return this.exitPromise;
        }

        this.exitPromise = new Promise<void>((resolve) => this.exitResolve = resolve);
        this.exitPromise.then(() => {
            this.events().fireExit();
        });
        this.client.exit();
        return this.exitPromise;
    }

    public events() {
        return this.eventsImpl;
    }
}
