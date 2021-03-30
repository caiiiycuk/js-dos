import { Emulators, CommandInterface } from "../emulators";
import { Cache } from "../cache";
import { IWasmModules } from "./modules";
import DosBundle from "../dos/bundle/dos-bundle";
declare class EmulatorsImpl implements Emulators {
    pathPrefix: string;
    cacheSeed: string;
    private cachePromises;
    private wasmModulesPromise?;
    cache(cacheName?: string): Promise<Cache>;
    dosBundle(): Promise<DosBundle>;
    dosDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    dosWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    janus(restUrl: string): Promise<CommandInterface>;
    wasmModules(): Promise<IWasmModules>;
}
declare const emulators: EmulatorsImpl;
export default emulators;
