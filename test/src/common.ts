import { assert } from "chai";

import { host } from "../../client/jsdos/src/jsdos-wasm";
import { DosMiddleware } from "../../client/shared/jsdos-shared";

import Dos from "../../client/jsdos/src/jsdos";

export default function testCommons(middleware: DosMiddleware) {
    test("loader should rejects when wasm not supported", async () => {
        host.wasmSupported = false;
        try {
            await Dos("dos", middleware);
            assert.fail();
        } catch (e) {
            assert.equal("Starting from js-dos 6.22.60 js environment is not supported", e.message);
        }
    });
}
