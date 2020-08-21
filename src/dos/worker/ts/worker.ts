import { CommandInterface, Logger } from "../../../emulators";
import { WorkerClient, WorkerHost, FrameLine } from "./worker-client";

import { WasmModule } from "../../../impl/modules";
import { CommandInterfaceEventsImpl } from "../../../impl/ci-impl";
import { DosConfig } from "../../bundle/dos-conf";

export default function DosWorker(workerUrl: string,
                                  wasm: WasmModule,
                                  bundle: Uint8Array,
                                  logger: Logger): Promise<CommandInterface> {
    return new Promise<CommandInterface>((resolve, reject) => {
        try {
            let startupErrorLog: string | undefined;
            const onErr = logger.onErr;
            logger.onErr = (...args: any[]) => {
                startupErrorLog = (startupErrorLog || "") + args.join(" ") + "\n";
            }

            new WorkerCommandInterface(workerUrl,
                                       wasm,
                                       bundle,
                                       logger,
                                       (ci) => {
                                           if (startupErrorLog !== undefined) {
                                               ci.exit()
                                                   .then(() => reject(new Error(startupErrorLog)))
                                                   .catch(reject);
                                           } else {
                                               logger.onErr = onErr;
                                               resolve(ci);
                                           }
                                       });
        } catch (e) {
            reject(e);
        }
    });
}

class WorkerCommandInterface implements CommandInterface, WorkerHost {

    private frameWidth: number = 0;
    private frameHeight: number = 0;
    private rgba: Uint8Array = new Uint8Array();
    private client: WorkerClient;

    private persistPromise?: Promise<Uint8Array>;
    private persistResolve?: (bundle: Uint8Array) => void;

    private exitPromise?: Promise<void>;
    private exitResolve?: () => void;

    private logger: Logger;

    private eventsImpl = new CommandInterfaceEventsImpl();

    private freq = 0;

    private configPromise: Promise<DosConfig>;
    private configResolve: (config: DosConfig) => void = () => {};

    constructor(workerUrl: string,
                wasmModule: WasmModule,
                bundle: Uint8Array,
                logger: Logger,
                ready: (ci: CommandInterface) => void) {
        this.logger = logger;
        this.configPromise = new Promise<DosConfig>((resolve) => this.configResolve = resolve);
        this.client = new WorkerClient(workerUrl,
                                       wasmModule,
                                       bundle,
                                       this,
                                       () => {
                                           ready(this);
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
        this.logger.onLog(...args);
    }

    onWarn(...args: any[]) {
        this.logger.onWarn(...args);
    }

    onErr(...args: any[]) {
        this.logger.onErr(...args);
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


    public simulateKeyPress(keyCode: number) {
        this.sendKeyEvent(keyCode, true);
        setTimeout(() => {
            this.sendKeyEvent(keyCode, false);
        }, 16);
    }

    public sendKeyEvent(keyCode: number, pressed: boolean) {
        this.client.addKey(keyCode, pressed);
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
