import { assert } from "chai";

import * as tar from "tar-stream";
import * as toArray from "stream-to-array";

function testTar() {
    test("tar should pack/unpack file", async () => {
        const pack = tar.pack();
        pack.entry({ name: "/test/file1" }, "file1-content");
        pack.entry({ name: "file2" }, "file2-content");
        pack.finalize();

        const parts = toArray(pack);
        assert.ok(Array.isArray(parts));
        console.log(parts);
    });
}


export function testBundle() {
    suite("Tar");
    testTar();
}
