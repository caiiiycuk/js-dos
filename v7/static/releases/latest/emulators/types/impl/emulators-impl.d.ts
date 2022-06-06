import { Emulators, CommandInterface, BackendOptions } from "../emulators";
import { IWasmModules } from "./modules";
import DosBundle from "../dos/bundle/dos-bundle";
import { TransportLayer } from "../protocol/protocol";
declare class EmulatorsImpl implements Emulators {
    pathPrefix: string;
    version: string;
    wdosboxJs: string;
    private wasmModulesPromise?;
    dosBundle(): Promise<DosBundle>;
    dosboxNode(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface>;
    dosboxDirect(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface>;
    dosboxWorker(bundle: Uint8Array | Uint8Array[], options?: BackendOptions): Promise<CommandInterface>;
    janus(restUrl: string): Promise<CommandInterface>;
    backend(bundle: Uint8Array | Uint8Array[], transportLayer: TransportLayer, options?: BackendOptions): Promise<CommandInterface>;
    wasmModules(): Promise<IWasmModules>;
    dosDirect(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
    dosWorker(bundle: Uint8Array | Uint8Array[]): Promise<CommandInterface>;
}
declare const emulators: EmulatorsImpl;
export default emulators;
