/* tslint:disable:max-line-length */

import * as assert from "assert";
import { Dos } from "../js-dos-ts/js-dos";
import { Host } from "../js-dos-ts/js-dos-host";
import { DosModule } from "../js-dos-ts/js-dos-module";
import { DosOptions } from "../js-dos-ts/js-dos-options";

suite("js-dos-host");

test("loader should notify about error if wasm is not supported", (done) => {
    const oldValue = Host.wasmSupported;
    Host.wasmSupported = false;
    Host.resolveDosBox("wrongurl.js", {
        onerror: (message: string) => {
            Host.wasmSupported = oldValue;
            assert.equal("WebAssembly is not supported, can't resolve wdosbox", message);
            done();
        },
    } as DosModule);
});

test("loader should notify about error, if it can't download wdosbox", (done) => {
    Host.resolveDosBox("wrongurl.js", {
        onerror: (message: string) => {
            assert.equal("Can't download wasm, code: 404, message: connection problem, url: wrongurl.wasm", message);
            done();
        },
    } as DosModule);
});

test("loader should show progress loading", (done) => {
    let lastLoaded = -1;
    Host.resolveDosBox("wdosbox.js", {
        onprogress: (total: number, loaded: number) => {
            assert.equal(true, loaded < total);
            assert.equal(true, lastLoaded < loaded);
            lastLoaded = loaded;
        },
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

test("loader should never load twice wdosbox", (done) => {
    Host.resolveDosBox("wdosbox.js", {
        onprogress: (total: number, loaded: number) => {
            assert.fail();
        },
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

test("loader should fire event when wdosbox is loaded", (done) => {
    Host.resolveDosBox("wdosbox.js", {
        ondosbox: (dosbox: any, instantiateWasm: any) => {
            assert.ok(dosbox);
            assert.ok(instantiateWasm);
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as DosModule);
});

suite("js-dos");

test("js-dos can't start without canvas", (done) => {
    const jsdos = new Dos({
        onerror: (message: string) => {
            assert.equal("canvas field is required, but not set!", message);
            done();
        },
    } as DosOptions);
});

test("js-dos should start with canvas", (done) => {
    const jsdos = new Dos({
        canvas: "canvas",
        onready: () => {
            done();
        },
    });
});
