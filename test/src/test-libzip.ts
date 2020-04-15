import { assert } from "chai";

import loadWasmModule from "../../client/shared/jsdos-wasm"
import CacheNoop from "../../client/shared/jsdos-cache-noop";

import LibZip from "../../libzip/ts/src/jsdos-libzip";

async function makeLibZip() {
    const wasm = await loadWasmModule("/wlibzip.js", "WLIBZIP", new CacheNoop(), () => {});
    const module = await wasm.instantiate();
    return new LibZip(module);
}

export function testLibZip() {
    suite("libzip");
    test("libzip should pack fs", async () => {
        const libzip = await makeLibZip();
        assert.ok(libzip);
    });
}
