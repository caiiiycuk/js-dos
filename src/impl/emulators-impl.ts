import { Build } from "../build";
import { Emulators, CommandInterface } from "../emulators";
import { Cache, CacheDb } from "../cache";

import { IWasmModules, WasmModulesImpl } from "./modules";

import DosBundle from "../dos/bundle/dos-bundle";
import DosDirect from "../dos/direct/ts/direct";
import DosWorker from "../dos/worker/ts/worker";
import Janus from "../janus/janus-impl";

class EmulatorsImpl implements Emulators {
    pathPrefix = "";

    private cachePromise?: Promise<Cache>;
    private wasmModulesPromise?: Promise<IWasmModules>;

    cache(): Promise<Cache> {
        if (this.cachePromise === undefined) {
            this.cachePromise = CacheDb(Build.version, {
                // tslint:disable-next-line
                onErr: console.error,
            });
        }
        return this.cachePromise;
    }

    async dosBundle(): Promise<DosBundle> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();
        const cache = await this.cache();
        return new DosBundle(libzipWasm, cache);
    }

    async dosDirect(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosDirectWasm = await modules.dosDirect();
        return DosDirect(dosDirectWasm, bundle);
    }

    async dosWorker(bundle: Uint8Array): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosWorkerWasm = await modules.dosWorker();
        return DosWorker(this.pathPrefix + "wworker.js", dosWorkerWasm, bundle);
    }

    async janus(restUrl: string): Promise<CommandInterface> {
        return Janus(restUrl);
    }

    wasmModules(): Promise<IWasmModules> {
        if (this.wasmModulesPromise !== undefined) {
            return this.wasmModulesPromise;
        }

        const make = async () => {
            const cache = await this.cache();
            return new WasmModulesImpl(this.pathPrefix, cache);
        }

        this.wasmModulesPromise = make();
        return this.wasmModulesPromise;
    }

}

const emulators = new EmulatorsImpl();
export default emulators;
