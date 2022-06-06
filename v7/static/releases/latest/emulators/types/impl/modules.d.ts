export interface WasmModule {
    instantiate: (module?: any) => Promise<any>;
}
export interface IWasmModules {
    libzip: () => Promise<WasmModule>;
    dosbox: () => Promise<WasmModule>;
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
    private wdosboxJs;
    private libzipPromise?;
    private dosboxPromise?;
    wasmSupported: boolean;
    constructor(pathPrefix: string, wdosboxJs: string);
    libzip(): Promise<WasmModule>;
    dosbox(): Promise<WasmModule>;
    private loadModule;
}
export declare function loadWasmModule(url: string, moduleName: string, onprogress: (stage: string, total: number, loaded: number) => void): Promise<WasmModule>;
export {};
