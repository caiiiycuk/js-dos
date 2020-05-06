import { CommandInterface, Logger } from "../../../emulators";
import { WasmModule } from "../../../modules";
import { WorkerClient, WorkerHost, FrameLine } from "./worker-client";

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

    private width: number = 0;
    private height: number = 0;
    private rgba: Uint8ClampedArray = new Uint8ClampedArray();
    private client: WorkerClient;

    private persistPromise?: Promise<Uint8Array>;
    private persistResolve?: (bundle: Uint8Array) => void;

    private exitPromise?: Promise<void>;
    private exitResolve?: () => void;

    private logger: Logger;

    constructor(workerUrl: string,
                wasmModule: WasmModule,
                bundle: Uint8Array,
                logger: Logger,
                ready: (ci: CommandInterface) => void) {
        this.logger = logger;
        this.client = new WorkerClient(workerUrl,
                                       wasmModule,
                                       bundle,
                                       this,
                                       () => {
                                           ready(this);
                                       });
    }

    onFrameSize(width: number, height: number) {
        if (this.width == width && this.height == height) {
            return;
        }

        this.width = width;
        this.height = height;
        this.rgba = new Uint8ClampedArray(width * height * 4);
    }

    onFrameLines(lines: FrameLine[]) {
        for (const line of lines) {
            this.rgba.set(line.heapu8, line.start * this.width * 4);
        }
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
        this.logger.onStdout(message);
    }

    onExit() {
        if (this.exitResolve) {
            this.exitResolve();
            delete this.exitPromise;
            delete this.exitResolve;
        }
    }

    screenshot(): Promise<ImageData> {
        for (let next = 3; next < this.rgba.byteLength; next = next + 4) {
            this.rgba[next] = 255;
        }

        return Promise.resolve(new ImageData(this.rgba, this.width, this.height));
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
        this.client.exit();
        return this.exitPromise;
    }
}
