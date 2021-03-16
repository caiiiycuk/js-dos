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
    cacheSeed = "";

    private cachePromises: {[cacheName: string]: Promise<Cache>} = {};
    private wasmModulesPromise?: Promise<IWasmModules>;

    cache(cacheName?: string): Promise<Cache> {
        if (cacheName === undefined || cacheName === null || cacheName.length === 0) {
            cacheName = Build.version + " " + this.cacheSeed;
        }

        const cachePromise = this.cachePromises[cacheName];

        if (cachePromise === undefined) {
            const promise = CacheDb(cacheName, {
                // tslint:disable-next-line
                onErr: console.error,
            });

            this.cachePromises[cacheName] = promise;
        }

        return this.cachePromises[cacheName];
    }

    async dosBundle(): Promise<DosBundle> {
        const modules = await this.wasmModules();
        const libzipWasm = await modules.libzip();
        const cache = await this.cache();
        return new DosBundle(libzipWasm, cache);
    }

    async dosDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosDirectWasm = await modules.dosDirect();
        return DosDirect(dosDirectWasm,
                         Array.isArray(bundle) ? bundle : [bundle]);
    }

    async dosWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface> {
        const modules = await this.wasmModules();
        const dosWorkerWasm = await modules.dosWorker();
        return DosWorker(this.pathPrefix + "wworker.js", dosWorkerWasm,
                         Array.isArray(bundle) ? bundle : [bundle]);
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
