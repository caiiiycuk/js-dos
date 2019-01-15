import { Build } from "./js-dos-build";
import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

class DosHost {

    public wasmSupported = false;
    public global = window as any;

    private wdosboxPromise: Promise<any> = null;

    constructor() {
        this.global.exports = {};

        try {
            if (typeof WebAssembly === "object" &&
                typeof WebAssembly.instantiate === "function" &&
                typeof WebAssembly.compile === "function") {

                const wmodule = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
                if (wmodule instanceof WebAssembly.Module) {
                    this.wasmSupported = new WebAssembly.Instance(wmodule) instanceof WebAssembly.Instance;
                }
            }
        } catch (error) {
            // do nothing WebAssembly is not supported
        }

        this.polyfill();
    }

    public resolveDosBox(url: string, module: DosModule) {
        if (this.global.exports.WDOSBOX) {
            module.ondosbox(this.global.exports.WDOSBOX, this.global.exports.instantiateWasm);
            return;
        }

        if (!this.wasmSupported) {
            module.onerror("WebAssembly is not supported, can't resolve wdosbox");
            return;
        }

        if (this.wdosboxPromise === null) {
            this.wdosboxPromise = this.compileDosBox(url, module);
        }

        this.wdosboxPromise.then((instance: any) => {
            // leave promise scope
            const fn = () => {
                this.wdosboxPromise = null;
                module.ondosbox(this.global.exports.WDOSBOX, this.global.exports.instantiateWasm);
            };
            setTimeout(fn, 1);
        }, (message: string) => {
            // leave promise scope
            const fn = () => {
                this.wdosboxPromise = null;
                module.onerror(message);
            };
            setTimeout(fn, 1);
        });
    }

    private compileDosBox(url: string, module: DosModule) {
        const buildTotal = Build.wasmSize + Build.jsSize;
        return new Promise((resolve, reject) => {
            const wasmUrl = url.replace(".js", ".wasm");

            new Xhr(wasmUrl, {
                responseType: "arraybuffer",
                progress: (total, loaded) => {
                    if (module.onprogress) {
                        module.onprogress(buildTotal, loaded);
                    }
                },
                fail: (url: string, status: number, message: string) => {
                    reject("Can't download wasm, code: " + status +
                        ", message: " + message + ", url: " + url);
                },
                success: (response: any) => {
                    const promise = WebAssembly.compile(response);
                    const onreject = (reason: any) => {
                        reject(reason + "");
                    };
                    promise.catch(onreject);
                    promise.then((wasmModule) => {
                        this.global.exports.instantiateWasm = (info: any, receiveInstance: any) => {
                            return WebAssembly.instantiate(wasmModule, info)
                                .catch(onreject)
                                .then((instance) => {
                                    receiveInstance(instance, wasmModule);
                                });
                        };

                        new Xhr(url, {
                            progress: (total, loaded) => {
                                if (module.onprogress) {
                                    module.onprogress(buildTotal, Build.wasmSize + loaded);
                                }
                            },
                            fail: (url: string, status: number, message: string) => {
                                reject("Can't download wdosbox.js, code: " + status +
                                    ", message: " + message + ", url: " + url);
                            },
                            success: (response: any) => {
                                /* tslint:disable:no-eval */
                                eval.call(window, response);
                                resolve(this.global.exports.WDOSBOX);
                            },
                        });
                    });
                },
            });
        });
    }

    /* tslint:disable:no-bitwise */
    /* tslint:disable:only-arrow-functions */
    private polyfill() {
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
    }
}

export const Host = new DosHost();
