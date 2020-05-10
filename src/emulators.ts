import { Build } from "./build";
import { IWasmModules, WasmModulesImpl } from "./modules";
import { Cache, CacheDb, CacheNoop } from "./cache";

import DosBundle from "./dos/bundle/dos-bundle";
import DosDirect from "./dos/direct/ts/direct";
import DosWorker from "./dos/worker/ts/worker";

class EmulatorsImpl {
    pathPrefix = "";

    private wasmModulesPromise?: Promise<IWasmModules>;
    private cache: Cache;
    private logger: Logger;

    constructor() {
        this.cache = new CacheNoop();
        this.logger = {
            onLog(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.log(...args);
            },
            onWarn(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.warn(...args);
            },
            onErr(...args: any[]) {
                // tslint:disable-next-line:no-console
                console.error(...args);
            },
            // tslint:disable-next-line:no-empty
            onStdout(message: string) {
            }
        };
    }

    async dosBundle(): Promise<DosBundle> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();
        return new DosBundle(libzipWasm, this.cache);
    }

    async dosDirect(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosDirectWasm = await modules.dosDirect();
        return DosDirect(dosDirectWasm, bundle, this.logger);
    }

    async dosWorker(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosWorkerWasm = await modules.dosWorker();
        return DosWorker(this.pathPrefix + "wworker.js", dosWorkerWasm, bundle, this.logger);
    }

    wasmModules(): Promise<IWasmModules> {
        if (this.wasmModulesPromise !== undefined) {
            return this.wasmModulesPromise;
        }

        const make = async () => {
            this.cache = await CacheDb(Build.version);
            return new WasmModulesImpl(this.pathPrefix, this.cache);
        }

        this.wasmModulesPromise = make();
        return this.wasmModulesPromise;
    }

}

const Emulators = new EmulatorsImpl();
export default  Emulators;


export interface CommandInterface {
    // * `screenshot()` - get screnshot of canvas as ImageData
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode
    simulateKeyPress: (keyCode: number) => void;

    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // dump FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;
}


export interface Logger {
    onLog: (...args: any[]) => void;
    onWarn: (...args: any[]) => void;
    onErr: (...args: any[]) => void;
    onStdout: (message: string) => void;
}



