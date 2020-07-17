import * as fs from "fs";

import { src, dest, series, parallel } from "gulp";
import del from "del";

import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import size from "gulp-size";
import rename from "gulp-rename";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// tslint:disable-next-line:no-var-requires
const tsify = require("tsify");

function clean() {
    return del(["dist/*"], { force: true });
}

function copyCss() {
    return src("node_modules/emulators-ui/dist/emulators-ui.css")
        .pipe(rename("js-dos.css"))
        .pipe(dest("dist"));
}

function copyWasm() {
    return src([
        "node_modules/emulators/dist/wworker.js",
        "node_modules/emulators/dist/wworker.js.symbols",
        "node_modules/emulators/dist/wworker.wasm",
    ]).pipe(dest("dist"));
}

function js() {
    return browserify({
        debug: true,
        entries: [
            "node_modules/emulators/dist/emulators.js",
            "node_modules/emulators-ui/dist/emulators-ui.js",
            "src/js-dos.ts",
        ],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            "target": "esnext",
        })
        .transform("babelify", {
            presets: [["@babel/preset-env", {
                "useBuiltIns": "usage",
                "corejs": 2,
            }]],
            extensions: [".ts"]
        })
        .bundle()
        .pipe(source("js-dos.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

export const jsdos = series(clean, js, copyCss, copyWasm);
