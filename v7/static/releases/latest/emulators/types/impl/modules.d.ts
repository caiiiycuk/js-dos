import { Cache } from "../cache";
export interface WasmModule {
    instantiate: (module?: any) => Promise<any>;
}
export interface IWasmModules {
    libzip: () => Promise<WasmModule>;
    dosDirect: () => Promise<WasmModule>;
    dosWorker: () => Promise<WasmModule>;
}
interface Globals {
    exports: {
        [moduleName: string]: any;
    };
    compiled: {
        [moduleName: string]: Promise<WasmModule>;
    };
}
declare class Host {
    wasmSupported: boolean;
    globals: Globals;
    constructor();
}
export declare const host: Host;
export declare class WasmModulesImpl implements IWasmModules {
    private pathPrefix;
    private cache;
    private libzipPromise?;
    private dosDirectPromise?;
    private dosWorkerPromise?;
    wasmSupported: boolean;
    constructor(pathPrefix: string, cache: Cache);
    libzip(): Promise<WasmModule>;
    dosDirect(): Promise<WasmModule>;
    dosWorker(): Promise<WasmModule>;
    private loadModule;
}
export declare function loadWasmModule(url: string, moduleName: string, cache: Cache, onprogress: (stage: string, total: number, loaded: number) => void): Promise<WasmModule>;
export {};
