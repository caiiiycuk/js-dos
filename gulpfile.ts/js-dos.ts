import { src, dest, series } from "gulp";
import size from "gulp-size";
import sourcemaps from "gulp-sourcemaps";

import { playerJs as playerJs } from "./js-dos-player";

import del from "del";
const concat = require("gulp-concat");

function clean() {
    return del(["dist/*"], { force: true });
}

function finalize() {
    return del(["dist/player.js"]);
}

function concatCss() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui.css",
        "src/js-dos-player.css"
    ])
        .pipe(concat("js-dos.css"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

function copyWasm() {
    return src([
        "node_modules/emulators/dist/wdosbox.js",
        "node_modules/emulators/dist/wdosbox.js.symbols",
        "node_modules/emulators/dist/wdosbox.wasm",
    ])
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

function concatJs() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui.js",
        "node_modules/emulators/dist/emulators.js",
        "dist/player.js"
    ])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat("js-dos.js"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(sourcemaps.write())
        .pipe(dest("dist"));
}

function copyAssets() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui-loader.gif",
        "src/logo.png",
    ])
        .pipe(dest("dist"));
}

export const jsdos = series(clean, playerJs, concatJs, concatCss, copyWasm, copyAssets, finalize);
