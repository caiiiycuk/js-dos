/* tslint:disable:max-line-length */

import * as assert from "assert";
import { JsDos } from "../js-dos-ts/js-dos";
import { resolveDosBox } from "../js-dos-ts/js-dos-dosbox";
import { JsDosModule } from "../js-dos-ts/js-dos-module";
import { JsDosOptions } from "../js-dos-ts/js-dos-options";

suite("js-dos");

test("loader should notify about error, if it can't download wdosbox", (done) => {
    resolveDosBox("wrongurl.js", {
        onerror: (message: string) => {
            assert.equal(true, message.startsWith("Can't download wdosbox.js, code: 404"));
            done();
        },
    } as JsDosModule);
});

test("loader should fire event when wdosbox is loaded", (done) => {
    resolveDosBox("wdosbox.js", {
        ondosbox: (dosbox: any) => {
            assert.ok(dosbox);
            done();
        },
        onerror: (message: string) => {
            assert.fail();
        },
    } as JsDosModule);
});

test("js-dos can't start without canvas", (done) => {
    const jsdos = new JsDos({
        onerror: (message: string) => {
            assert.equal("canvas field is required, but not set!", message);
            done();
        },
    } as JsDosOptions);
});

test("js-dos should start with canvas", (done) => {
    const jsdos = new JsDos({
        canvas: "canvas",
        onready: () => {
            done();
        },
    });
});

test("js-dos should start with canvas 2", (done) => {
    const jsdos = new JsDos({
        canvas: "canvas",
        onready: () => {
            done();
        },
    });
});