import { assert } from "chai";

import { WasmModulesImpl } from "../../src/modules";
import { CacheNoop } from "../../src/cache";
import LibZip from "../../native/libzip/ts/src/jsdos-libzip";

export async function makeLibZip() {
    const wasm = await new WasmModulesImpl("/", new CacheNoop()).libzip();
    const module = await wasm.instantiate();
    return new LibZip(module, "/home/web_user");
}

export function destroy(libzip: LibZip) {
    const exitStatus = libzip.destroy();
    assert.equal(exitStatus.name, "ExitStatus");
    assert.equal(exitStatus.status, 0);
}
