import { assert } from "chai";

import { loadWasmModule, host } from "../../src/modules";
import { Cache, CacheNoop } from "../../src/cache";

export function testLoader() {
    suite("WASM loader");

    test("loader should rejects when wasm not supported", async () => {
        host.wasmSupported = false;
        try {
            await loadWasmModule("wrongurl.js", "", new CacheNoop(), () => { /**/ });
            host.wasmSupported = true;
            assert.fail();
        } catch (e) {
            host.wasmSupported = true;
            assert.equal("Starting from js-dos 6.22.60 js environment is not supported", e.message);
        }
    });

    test("loader should rejects when js file not exists", async () => {
        try {
            await loadWasmModule("wrongurl.js", "", new CacheNoop(), () => { /**/ });
            assert.fail();
        } catch (e) {
            assert.equal("Unable to download 'wrongurl.wasm', code: 404", e.message);
        }
    });

    test("loader should show progress loading and use cache", async () => {
        const moduleUrl = "/wdirect.js"

        let cacheGetUsed = false;
        let cachePutUsed = false;
        class TestCache implements Cache {
            public close() {
            }

            public put(key: string, data: ArrayBuffer): Promise<void> {
                cachePutUsed = cachePutUsed || (key === moduleUrl.replace(".js", ".wasm") && data instanceof ArrayBuffer && (data as ArrayBuffer).byteLength > 0);
                return Promise.resolve();
            }

            public get(key: string, defaultValue?: string | ArrayBuffer): Promise<string|ArrayBuffer> {
                cacheGetUsed = cacheGetUsed || key === moduleUrl.replace(".js", ".wasm");
                return Promise.reject(new Error("not in cache"));
            }

            public forEach(each: (key: string, value: any) => void, onend: () => void) {
                onend();
            }
        }

        const module =
            await loadWasmModule(moduleUrl, "",
                                 new TestCache(),
                                 (stage: string, total: number, loaded: number) => {
                                     assert.equal(true, loaded <= total, "onprgoress: " + loaded + "<=" + total);
                                 });
        assert.ok(cacheGetUsed);
        assert.ok(cachePutUsed);
    });

    test("loader should never load module twice", async () => {
        const moduleUrl = "/wdirect.js";

        class TestCache implements Cache {
            public close() {
            }

            public put(key: string, data: ArrayBuffer): Promise<void> {
                assert.fail();
            }

            public get(key: string, defaultValue?: string | ArrayBuffer): Promise<string|ArrayBuffer> {
                return Promise.resolve(new Int8Array([]));
            }

            public forEach(each: (key: string, value: any) => void, onend: () => void) {
                onend();
            }
        }

        try {
            await loadWasmModule(moduleUrl, "", new TestCache(),
                                 () => assert.fail("downloading..."));
            assert.fail();
        } catch (e) {
            const isValidMessage = "wasm validation error: at offset 0: failed to match magic number" === e.message ||
                "WebAssembly.compile(): BufferSource argument is empty" === e.message ||
                "WebAssembly.Module doesn't parse at byte 0: expected a module of at least 8 bytes" === e.message;
            assert.ok(isValidMessage, "Error message is not valid: '" + e.message + "'");
        }
    });
}
