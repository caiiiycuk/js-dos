import { assert } from "chai";
import { compareAndExit } from "./compare"

import { host } from "../../client/jsdos/src/jsdos-wasm";
import { ICache } from "../../client/shared/jsdos-cache";
import { DosMiddleware } from "../../client/shared/jsdos-shared";

import Dos from "../../client/jsdos/src/jsdos";
import loadWasmModule from "../../client/jsdos/src/jsdos-wasm";
import CacheNoop from "../../client/jsdos/src/jsdos-cache-noop";

export function testLoader() {
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
            assert.equal("Can\'t download wasm, code: 404, message: connection problem, url: wrongurl.wasm", e.message);
        }
    });

    test("loader should show progress loading and use cache", async () => {
        const moduleUrl = "/wsokol.js"

        let cacheGetUsed = false;
        let cachePutUsed = false;
        class TestCache implements ICache {
            public put(key: string, data: any, onflush: () => void) {
                cachePutUsed = cachePutUsed || (key === moduleUrl.replace(".js", ".wasm") && data instanceof ArrayBuffer && (data as ArrayBuffer).byteLength > 0);
                onflush();
            }

            public get(key: string, ondata: (data: any) => void, onerror: (msg: string) => void) {
                cacheGetUsed = cacheGetUsed || key === moduleUrl.replace(".js", ".wasm");
                onerror("not in cache");
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
        const moduleUrl = "/wsokol.js";

        class TestCache implements ICache {
            public put(key: string, data: any, onflush: () => void) {
                assert.fail();
            }

            public get(key: string, ondata: (data: any) => void, onerror: (msg: string) => void) {
                ondata(new Int8Array([]));
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
            assert.ok("CompileError: wasm validation error: at offset 0: failed to match magic number" == e.message ||
                "CompileError: WebAssembly.compile(): BufferSource argument is empty" == e.message);
        }
    });
}

export function testCommons(middleware: DosMiddleware) {
    test("js-dos can't start without canvas", async () => {
        try {
            await Dos(null, middleware);
            assert.fail();
        } catch (e) {
            assert.equal("Element #dosbox not found in DOM", e.message);
        }
    });

    test("js-dos should start with canvas", async () => {
        const ci = await Dos("jsdos",
                             middleware, {
                                 middlewareUrl: "/" + middleware.defaultUrl,
                             });
        assert.ok(ci);
    });

    test("js-dos can take screenshot of canvas", async () => {
        const ci = await Dos("jsdos",
                             middleware, {
                                 middlewareUrl: "/" + middleware.defaultUrl,
                             });
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });
}
