import { assert } from "chai";

import loadWasmModule from "../../client/jsdos/src/jsdos-wasm";
import CacheNoop from "../../client/jsdos-cache/jsdos-cache-noop";
import LibZip from "../../native/libzip/ts/src/jsdos-libzip";

export async function makeLibZip() {
    const wasm = await loadWasmModule("/wlibzip.js", "WLIBZIP", new CacheNoop(), () => {});
    const module = await wasm.instantiate();
    return new LibZip(module, "/home/web_user");
}

export function destroy(libzip: LibZip) {
    const exitStatus = libzip.destroy();
    assert.equal(exitStatus.name, "ExitStatus");
    assert.equal(exitStatus.status, 0);
}
