import { Cache } from "./cache";
import { HTTPRequest } from "./http";

export interface WasmModule {
    instantiate: (module?: any) => Promise<any>;
}

export interface IWasmModules {
    libzip: () => Promise<WasmModule>;
    dosDirect: () => Promise<WasmModule>;
    dosWorker: () => Promise<WasmModule>;
}

interface Globals {
    exports: {[moduleName: string]: any},
    compiled: {[moduleName: string]: Promise<WasmModule>},
}

class Host {
    public wasmSupported = false;
    public globals: Globals;
    constructor() {
        this.globals = window as any;
        if (!this.globals.exports) {
            this.globals.exports = {};
        }
        if (!this.globals.compiled) {
            this.globals.compiled = {};
        }

        // ### WebAssembly
        // Host able to detect is WebAssembly supported or not,
        // this information is stored in `Host.wasmSupported` variable
        if (typeof WebAssembly === "object" &&
            typeof WebAssembly.instantiate === "function" &&
            typeof WebAssembly.compile === "function") {

            const wmodule = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (wmodule instanceof WebAssembly.Module) {
                this.wasmSupported = new WebAssembly.Instance(wmodule) instanceof WebAssembly.Instance;
            }
        }

        // Polyfill for old contains implementations for:
        // `Math.imul`, `Math.fround`, `Math.clz32`, `Math.trunc`
        /* tslint:disable:no-bitwise */
        /* tslint:disable:only-arrow-functions */
        (function polyfill() {
            if (!Math.imul || Math.imul(0xffffffff, 5) !== -5) {
                Math.imul = function imul(a: any, b: any) {
                    const ah = a >>> 16;
                    const al = a & 0xffff;
                    const bh = b >>> 16;
                    const bl = b & 0xffff;
                    return (al * bl + ((ah * bl + al * bh) << 16)) | 0;
                };
            }
            Math.imul = Math.imul;

            if (!Math.fround) {
                Math.fround = function(x) { return x; };
            }
            Math.fround = Math.fround;

            if (!Math.clz32) {
                Math.clz32 = function(x) {
                    x = x >>> 0;
                    for (let i = 0; i < 32; i++) {
                        if (x & (1 << (31 - i))) { return i; }
                    }
                    return 32;
                };
            }
            Math.clz32 = Math.clz32;

            if (!Math.trunc) {
                Math.trunc = function(x) {
                    return x < 0 ? Math.ceil(x) : Math.floor(x);
                };
            }
            Math.trunc = Math.trunc;
        })();
    }
}

export const host = new Host();

export class WasmModulesImpl implements IWasmModules {
    private pathPrefix: string;
    private cache: Cache;

    private libzipPromise?: Promise<WasmModule>;
    private dosDirectPromise?: Promise<WasmModule>;
    private dosWorkerPromise?: Promise<WasmModule>;

    public wasmSupported = false;

    constructor(pathPrefix: string,
                cache: Cache) {
        if (pathPrefix.length > 0 && pathPrefix[pathPrefix.length - 1] !== "/") {
            pathPrefix += "/";
        }

        this.pathPrefix = pathPrefix;
        this.cache = cache;
    }

    libzip() {
        if (this.libzipPromise !== undefined) {
            return this.libzipPromise;
        }

        this.libzipPromise = this.loadModule(this.pathPrefix + "wlibzip.js", "WLIBZIP");
        return this.libzipPromise;
    }

    dosDirect() {
        if (this.dosDirectPromise !== undefined) {
            return this.dosDirectPromise;
        }

        this.dosDirectPromise = this.loadModule(this.pathPrefix + "wdirect.js", "WDIRECT");
        return this.dosDirectPromise;
    }

    dosWorker() {
        if (this.dosWorkerPromise !== undefined) {
            return this.dosWorkerPromise;
        }

        this.dosWorkerPromise = this.loadModule(this.pathPrefix + "wworker.js", "WWORKER");
        return this.dosWorkerPromise;
    }

    private loadModule(url: string,
                             moduleName: string) {
        return loadWasmModule(url, moduleName, this.cache, () => {});
    }
}

export function loadWasmModule(url: string,
                               moduleName: string,
                               cache: Cache,
                               onprogress: (stage: string, total: number, loaded: number) => void) {
    if (host.globals.compiled[moduleName] !== undefined) {
        return host.globals.compiled[moduleName];
    }

    async function load() {
        const fromIndex = url.lastIndexOf("/");
        const wIndex = url.indexOf("w", fromIndex);
        const isWasmUrl = wIndex === fromIndex + 1 && wIndex >= 0;

        if (!host.wasmSupported || !isWasmUrl) {
            throw new Error("Starting from js-dos 6.22.60 js environment is not supported");
        }

        const wasmUrl = url.replace(".js", ".wasm");
        const binaryPromise = HTTPRequest(wasmUrl, {
            cache,
            responseType: "arraybuffer",
            progress: (total, loaded) => {
                onprogress("Resolving DosBox (" + url + ")", total, loaded);
            },
        });
        const scriptPromise = HTTPRequest(url, {
            cache,
            progress: (total, loaded) => {
                onprogress("Resolving DosBox", total, loaded);
            },
        });

        const [binary, script] = await Promise.all([binaryPromise, scriptPromise]);
        const wasmModule = await WebAssembly.compile(binary as ArrayBuffer);
        const instantiateWasm = (info: any, receiveInstance: any) => {
            info.env = info.env || {};
            WebAssembly.instantiate(wasmModule, info)
                .then((instance) => receiveInstance(instance, wasmModule));
            return; // no-return
        };

        /* tslint:disable:no-eval */
        eval.call(window, script as string);
        /* tslint:enable:no-eval */

        return new CompiledModule(host.globals.exports[moduleName],
                                  instantiateWasm);
    };

    const promise = load();

    if (moduleName) {
        host.globals.compiled[moduleName] = promise;
    }

    return promise;
}

class CompiledModule implements WasmModule {
    private module: any;
    private instantiateWasm: any;

    constructor(module: any, instantiateWasm: any) {
        this.module = module;
        this.instantiateWasm = instantiateWasm;
    }

    instantiate(module?: any): Promise<any> {
        module = module || {};
        module.instantiateWasm = this.instantiateWasm;
        new this.module(module);
        return new Promise<any>((resolve) => {
            module.then(() => {
                delete module.then;
                resolve(module);
            });
        });
    }
}
