import { Emulators, CommandInterface } from "../emulators";
import { Cache } from "../cache";
import { IWasmModules } from "./modules";
import DosBundle from "../dos/bundle/dos-bundle";
import { TransportLayer } from "../protocol/protocol";
declare class EmulatorsImpl implements Emulators {
    pathPrefix: string;
    cacheSeed: string;
    private cachePromises;
    private wasmModulesPromise?;
    cache(cacheName?: string): Promise<Cache>;
    dosBundle(): Promise<DosBundle>;
    dosboxNode(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    dosboxDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    dosboxWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    janus(restUrl: string): Promise<CommandInterface>;
    backend(bundle: Uint8Array | Uint8Array[], transportLayer: TransportLayer): Promise<CommandInterface>;
    wasmModules(): Promise<IWasmModules>;
    dosDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    dosWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
}
declare const emulators: EmulatorsImpl;
export default emulators;
