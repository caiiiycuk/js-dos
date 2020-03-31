// # DosHost
// This class is used to detect and provide information about
// features that supported in current environment

/* tslint:disable:member-ordering */
import { ICache } from "../../shared/jsdos-cache";
import { Xhr } from "./jsdos-xhr";
import { WasmModule, DosModule } from "../../shared/jsdos-shared";

class Host {
    public wasmSupported = false;
    constructor() {
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

export class CompiledModule implements WasmModule {
    private module: any;
    private instantiateWasm: any;

    constructor(module: any, instantiateWasm: any) {
        this.module = module;
        this.instantiateWasm = instantiateWasm;
    }

    instantiate(module: DosModule) {
        (module as any).instantiateWasm = this.instantiateWasm;
        new this.module(module);
    }

}

export default function loadWasmModule(url: string,
                                       moduleName: string,
                                       cache: ICache,
                                       onprogress: (stage: string, total: number, loaded: number) => void) {
    const globals: any = window;
    if (!globals.exports) {
        globals.exports = {};
    }
    return new Promise<WasmModule>((resolve, reject) => {
        const fromIndex = url.lastIndexOf("/");
        const wIndex = url.indexOf("w", fromIndex);
        const isWasmUrl = wIndex === fromIndex + 1 && wIndex >= 0;

        if (!host.wasmSupported || !isWasmUrl) {
            reject(new Error("Starting from js-dos 6.22.60 js environment is not supported"));
        }

        const wasmUrl = url.replace(".js", ".wasm");
        // * Download wasm file
        new Xhr(wasmUrl, {
            cache,
            responseType: "arraybuffer",
            progress: (total, loaded) => {
                onprogress("Resolving DosBox (" + url + ")", total, loaded);
            },
            fail: (url: string, status: number, message: string) => {
                reject(new Error("Can't download wasm, code: " + status +
                    ", message: " + message + ", url: " + url));
            },
            success: (response: any) => {
                // * Compile wasm module
                const promise = WebAssembly.compile(response);
                const onreject = (reason: any) => {
                    reject(new Error(reason + ""));
                };
                promise.catch(onreject);
                promise.then((wasmModule) => {
                    const instantiateWasm = (info: any, receiveInstance: any) => {
                        info.env = info.env || {};
                        return WebAssembly.instantiate(wasmModule, info)
                            .catch(onreject)
                            .then((instance) => {
                                receiveInstance(instance, wasmModule);
                            });
                    };

                    // * Download and eval js part of wasm module
                    new Xhr(url, {
                        cache,
                        progress: (total, loaded) => {
                            onprogress("Resolving DosBox", total, loaded);
                        },
                        fail: (url: string, status: number, message: string) => {
                            reject(new Error("Can't download wdosbox.js, code: " + status +
                                ", message: " + message + ", url: " + url));
                        },
                        success: (response: string) => {
                            response +=
                            /* tslint:disable:no-eval */
                            eval.call(window, response);
                            /* tslint:enable:no-eval */
                            resolve(new CompiledModule(globals.exports[moduleName],
                                                       instantiateWasm));
                        },
                    });
                });
            }
        });
    });
}
