import assert = require("assert");
import { DosReadyPromise, DosMainFn } from "../js-dos-ts/js-dos";
import { DosFS } from "../js-dos-ts/js-dos-fs";

// Do
// ==
// We use this functions to avoid problem of throwing,
// exceptions inside promise.
// Mocha can't handle exceptions if they are throwed in promise

export function doThen<T>(promise: Promise<T>, fn: (v: T) => void) {
    promise.then((v: T) => {
        const topFn = () => {
            fn(v);
        };

        setTimeout(topFn, 1);
    });
}

export function doCatch<T>(promise: Promise<T>, fn: (v: string) => void) {
    promise.catch((v: string) => {
        const topFn = () => {
            fn(v);
        };

        setTimeout(topFn, 1);
    });
}

export function doNext<T>(promise: Promise<T>, fn: (v: T) => void) {
    doThen(promise, fn);
    doCatch(promise, (msg: string) => assert.fail(msg));
}

export function doReady(promise: DosReadyPromise, fn: (fs: DosFS, main: DosMainFn) => void) {
    doThen(promise, (runtime) => {
        fn(runtime.fs, runtime.main);
    });
    doCatch(promise, (msg: string) => assert.fail(msg));
}
