/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import * as assert from "assert";
import { Dos } from "../js-dos-ts/js-dos";
import { DosCommandInteface } from "../js-dos-ts/js-dos-ci";
import { Host } from "../js-dos-ts/js-dos-host";
import { DosModule } from "../js-dos-ts/js-dos-module";
import { DosOptions } from "../js-dos-ts/js-dos-options";
import { compareAndExit } from "./compare";
import { doCatch, doNext, doThen } from "./do";

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
    Host.resolveDosBox("/wdosbox.js", {
        onprogress: (total: number, loaded: number) => {
            console.log("Resolving DosBox: ", total, loaded);
            assert.equal(true, loaded <= total);
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
    Host.resolveDosBox("/wdosbox.js", {
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
    Host.resolveDosBox("/wdosbox.js", {
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

test("js-dos can't start without canvas (listener style)", (done) => {
    Dos({
        wdosboxUrl: "/wdosbox.js",
        onerror: (message: string) => {
            assert.equal("canvas field is required, but not set!", message);
            done();
        },
    } as DosOptions);
});

test("js-dos can't start without canvas (promise style)", (done) => {
    const dos = Dos({
        wdosboxUrl: "/wdosbox.js",
    } as DosOptions);
    doCatch(dos, (message) => {
        assert.equal("canvas field is required, but not set!", message);
        done();
    });
    doThen(dos, () => {
        assert.fail();
    });
});

test("js-dos should start with canvas", (done) => {
    const dos = Dos({
        wdosboxUrl: "/wdosbox.js",
        canvas: (document.getElementById("canvas") as HTMLCanvasElement),
    });
    doNext(dos, (ci) => {
        ci.exit();
        done();
    });
});

test("js-dos can take screenshot of canvas", (done) => {
    const dos = Dos({
        wdosboxUrl: "/wdosbox.js",
        canvas: (document.getElementById("canvas") as HTMLCanvasElement),
    });
    doNext(dos, (ci) => {
        compareAndExit("init.png", ci, done);
    });
});

test("js-dos can run digger.zip", (done) => {
    const dos = Dos({
        wdosboxUrl: "/wdosbox.js",
        canvas: (document.getElementById("canvas") as HTMLCanvasElement),
        onready: (fs, main) => {
            doNext(fs.extract("digger.zip"), () => {
                main([]);
            });
        },
    });

    doNext(dos, (ci) => {
        doNext(ci.shell("mount c .", "c:", "DIGGER.COM"), () => {
            const fn = () => {
                compareAndExit("digger.png", ci, done);
            };

            setTimeout(fn, 500);
        });
    });
});

const saveImage = (ci: DosCommandInteface) => {
    ci.screenshot().then((data) => {
        const w = window.open("about:blank", "image from canvas");
        w.document.write("<img src='" + data + "' alt='from canvas'/>");
    });
};
