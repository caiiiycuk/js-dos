import { assert } from "chai";

import loadWasmModule from "../../client/shared/jsdos-wasm"
    test("libzip should start/stop", async () => {
        const libzip = await makeLibZip();
        assert.ok(libzip);
        destroy(libzip);
    });

    let archive: Uint8Array = new Uint8Array();
    test("libzip create archive from fs", async () => {
        const libzip = await makeLibZip();

        createFile(libzip.module, "file1", "file1-contents");
        createFile(libzip.module, "dir1/file1", "dir1-file1-contents");
        createFile(libzip.module, "dir1/file2", "dir1-file2-contents");
        createFile(libzip.module, "dir1/dir2/file1", "dir1-dir2-file1-contents");

        archive = await libzip.zipFromFs();
        assert.ok(archive);
        assert.ok(archive.length > 0);
        destroy(libzip);
    });

    test("libzip extract archive to fs", async () => {
        const libzip = await makeLibZip();

        assert.ok(!exists(libzip.module, "file1"));
        assert.ok(!exists(libzip.module, "dir1/file1"));
        assert.ok(!exists(libzip.module, "dir1/file2"));
        assert.ok(!exists(libzip.module, "dir1/dir2/file1"));

        await libzip.zipToFs(archive);

        assert.equal(readFile(libzip.module, "file1"), "file1-contents");
        assert.equal(readFile(libzip.module, "dir1/file1"), "dir1-file1-contents");
        assert.equal(readFile(libzip.module, "dir1/file2"), "dir1-file2-contents");
        assert.equal(readFile(libzip.module, "dir1/dir2/file1"), "dir1-dir2-file1-contents");

        destroy(libzip);
    });

import CacheNoop from "../../client/shared/jsdos-cache-noop";

import LibZip from "../../libzip/ts/src/jsdos-libzip";

const home = "/home/web_user";

async function makeLibZip() {
    const wasm = await loadWasmModule("/wlibzip.js", "WLIBZIP", new CacheNoop(), () => {});
    const module = await wasm.instantiate();
    module.callMain([]);
    module.FS.chdir(home);
    return new LibZip(module);
}

function destroy(libzip: LibZip) {
    const exitStatus = libzip.destroy();
    assert.equal(exitStatus.name, "ExitStatus");
    assert.equal(exitStatus.status, 0);
}

function createFile(module: any, file: string, contents: string) {
    const parts = file.split("/");
    let path = home;
    for (let i = 0; i < parts.length - 1; ++i) {
        const part = parts[i];
        module.FS.createPath(path, part, true, true);
        path = path + "/" + part;
    }
   module.FS.createDataFile(path, parts[parts.length - 1], contents, true, true, true);
}

function readFile(module: any, file: string): string {
    return module.FS.readFile(file, { encoding: 'utf8' });
}

function exists(module: any, file: string): boolean {
    try {
        module.FS.lookupPath(file);
        return true;
    } catch (e) {
        return false;
    }
}

export function testLibZip() {
    suite("libzip");

    test("libzip should start/stop", async () => {
        const libzip = await makeLibZip();
        assert.ok(libzip);
        destroy(libzip);
    });

    let archive: Uint8Array = new Uint8Array();
    test("libzip create archive from fs", async () => {
        const libzip = await makeLibZip();

        createFile(libzip.module, "file1", "file1-contents");
        createFile(libzip.module, "dir1/file1", "dir1-file1-contents");
        createFile(libzip.module, "dir1/file2", "dir1-file2-contents");
        createFile(libzip.module, "dir1/dir2/file1", "dir1-dir2-file1-contents");

        archive = await libzip.zipFromFs();
        assert.ok(archive);
        assert.ok(archive.length > 0);
        destroy(libzip);
    });

    test("libzip extract archive to fs", async () => {
        const libzip = await makeLibZip();

        assert.ok(!exists(libzip.module, "file1"));
        assert.ok(!exists(libzip.module, "dir1/file1"));
        assert.ok(!exists(libzip.module, "dir1/file2"));
        assert.ok(!exists(libzip.module, "dir1/dir2/file1"));

        await libzip.zipToFs(archive);

        assert.equal(readFile(libzip.module, "file1"), "file1-contents");
        assert.equal(readFile(libzip.module, "dir1/file1"), "dir1-file1-contents");
        assert.equal(readFile(libzip.module, "dir1/file2"), "dir1-file2-contents");
        assert.equal(readFile(libzip.module, "dir1/dir2/file1"), "dir1-dir2-file1-contents");

        destroy(libzip);
    });


}
