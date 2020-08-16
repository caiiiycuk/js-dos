import { CommandInterface, Logger } from "../../../emulators";

import { WasmModule } from "../../../impl/modules";
import { CommandInterfaceEventsImpl } from "../../../impl/ci-impl";

export default async function DosDirect(wasm: WasmModule,
                                        bundle: Uint8Array,
                                        logger: Logger): Promise<CommandInterface> {
    const eventsImpl = new CommandInterfaceEventsImpl();

    const errFn = (...args: any) => {
        logger.onErr(...args);
    }

    let startupErrorLog: string | undefined;
    const onErr = logger.onErr;
    logger.onErr = (...args: any[]) => {
        startupErrorLog = (startupErrorLog || "") + args.join(" ") + "\n";
    }

    const module: any = {
        log: logger.onLog,
        warn: logger.onWarn,
        err: errFn,
        stdout: eventsImpl.fireStdout,
    };

    await wasm.instantiate(module);

    module.print = logger.onLog;
    module.printErr = logger.onErr;

    const ci = await new Promise<CommandInterface>((resolve, reject) => {
        try {
            new DirectCommandInterface(module, bundle, eventsImpl, resolve);
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
    private eventsImpl: CommandInterfaceEventsImpl;
    private freq: number = 0;

    constructor(module: any,
                bundle: Uint8Array,
                eventsImpl: CommandInterfaceEventsImpl,
                ready: (ci: CommandInterface) => void) {
        this.module = module;
        this.module.onFrameSize = (width: number, height: number) => {
            eventsImpl.fireFrameSize(width, height);
        };
        this.module.onFrame = (rgbaPtr: number) => {
            const rgba = this.module.HEAPU8.slice(rgbaPtr, rgbaPtr + this.width() * this.height() * 4);
            eventsImpl.fireFrame(rgba);
        };
        this.module.onSoundInit = (freq: number) => {
            this.freq = freq;
        };
        this.module.onSoundPush = (samples: number, numSamples: number) => {
            const soundData = this.module.HEAPF32.slice(samples / 4, samples /4 + numSamples);
            eventsImpl.fireSoundPush(soundData);
        };
        this.module.bundle = new Uint8Array(bundle);
        this.eventsImpl = eventsImpl;
        this.module.callMain([]);
        setTimeout(() => ready(this), 16);
        this.module._runRuntime();
    }

    width() {
        return this.module._getFrameWidth();
    }

    height() {
        return this.module._getFrameHeight();
    }

    soundFrequency() {
        return this.freq;
    }

    screenshot(): Promise<ImageData> {
        const width = this.width();
        const height = this.height();
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
        }).then(() => {
            this.events().fireExit();
        });

        return this.exitPromise;
    }

    public events() {
        return this.eventsImpl;
    }
}
