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
// tslint:disable-next-line:no-var-requires
const footer = require("gulp-footer");

function clean() {
    return del(["dist/emulators*",
                "build/wworker-footer*"], { force: true });
};

function js() {
    return browserify({
        debug: true,
        entries: ["src/emulators.ts"],
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
        .pipe(source("emulators.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

function workerJs() {
    return src("dist/wworker.js")
        .pipe(footer(fs.readFileSync("src/dos/worker/ts/worker-server.js")))
        .pipe(dest("dist"));
}

export const emulators = series(clean, parallel(js, workerJs));
