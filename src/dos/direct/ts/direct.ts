import { CommandInterface, Logger } from "../../../emulators";
import { WasmModule } from "../../../modules";

export default async function DosDirect(wasm: WasmModule,
                                        bundle: Uint8Array,
                                        logger: Logger): Promise<CommandInterface> {
    const errFn = (...args: any) => {
        logger.onErr(...args);
    }

    let startupErrorLog: string | undefined;
    const onErr = logger.onErr;
    logger.onErr = (...args: any[]) => {
        startupErrorLog = (startupErrorLog || "") + args.join(" ") + "\n";
    }

    const module = await wasm.instantiate({
        log: logger.onLog,
        warn: logger.onWarn,
        err: errFn,
        stdout: logger.onStdout,
    });

    const ci = await new Promise<CommandInterface>((resolve, reject) => {
        try {
            new DirectCommandInterface(module, bundle, resolve);
        } catch (e) {
            reject(e);
        }
    });

    if (startupErrorLog !== undefined) {
        await ci.exit();
        throw new Error(startupErrorLog);
    }

    logger.onErr = onErr;
    return ci;
}

class DirectCommandInterface implements CommandInterface {

    private module: any;
    private persistPromise?: Promise<Uint8Array>;
    private exitPromise?: Promise<void>;

    constructor(module: any,
                bundle: Uint8Array,
                ready: (ci: CommandInterface) => void) {
        this.module = module;
        this.module.bundle = new Uint8Array(bundle);
        this.module.callMain([]);
        setTimeout(() => ready(this), 16);
        this.module._runRuntime();
    }

    screenshot(): Promise<ImageData> {
        const width = this.module._getFrameWidth();
        const height = this.module._getFrameHeight();
        const rgbaPtr = this.module._getFrameRgba();

        const rgba = new Uint8ClampedArray(this.module.HEAPU8.buffer, rgbaPtr, width * height * 4);

        for (let next = 3; next < rgba.byteLength; next = next + 4) {
            rgba[next] = 255;
        }

        return Promise.resolve(new ImageData(rgba, width, height));
    }


    public simulateKeyPress(keyCode: number) {
        this.sendKeyEvent(keyCode, true);
        setTimeout(() => {
            this.sendKeyEvent(keyCode, false);
        }, 16);
    }

    public sendKeyEvent(keyCode: number, pressed: boolean) {
        this.module._addKey(keyCode, pressed);
    }

    public persist(): Promise<Uint8Array> {
        if (this.persistPromise !== undefined) {
            return this.persistPromise;
        }

        this.persistPromise = new Promise((resolve, reject) => {
            this.module.persist = (archive: Uint8Array) => {
                resolve(archive);
                delete this.module.persist;
            }

            try {
                this.module._packFsToBundle();
            } catch (e) {
                reject(e);
            }
        });

        return this.persistPromise;
    }

    public exit(): Promise<void> {
        if (this.exitPromise !== undefined) {
            return this.exitPromise;
        }

        this.exitPromise = new Promise((resolve) => {
            this.module.exit = resolve;
            this.module._requestExit();
        });

        return this.exitPromise;
    }
}
