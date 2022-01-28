import { src, dest, series, parallel } from "gulp";
import size from "gulp-size";
import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";

import { playerJs as playerJs } from "./player";

import del from "del";

import { execute } from "./execute";

// eslint-disable-next-line
const concat = require("gulp-concat");

function clean() {
    return del(["dist/*"], { force: true });
}

function finalize() {
    return del(["dist/player.js"]);
}

function playerCss() {
    return execute("yarn", "run",
        "tailwindcss",
        "-i", "src/player.css",
        "-o", "build/player.css");
}

function concatCss() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui.css",
        "build/player.css",
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
        "3rdparty/zip.js/zip-no-worker-inflate.min.js",
        "dist/player.js",
    ])
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(concat("js-dos.js"))
        .pipe(terser())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

function copyAssets() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui-loader.png",
    ])
        .pipe(dest("dist"));
}

export const js = series(playerJs, concatJs, finalize);
export const css = series(playerCss, concatCss);

export const jsdos = series(clean,
    parallel(playerJs, playerCss),
    concatJs, concatCss, copyWasm, copyAssets, finalize);
