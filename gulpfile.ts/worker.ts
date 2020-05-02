import { src, dest, series } from "gulp";
import del from "del";

import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import size from "gulp-size";
import rename from "gulp-rename";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import make from "./cmake";

// tslint:disable-next-line:no-var-requires
const tsify = require("tsify");
// tslint:disable-next-line:no-var-requires
const footer = require("gulp-footer");

function clean() {
    return del(["dist/worker*",
                "dist/wworker*"], { force: true });
};

async function wasm() {
    await make(".", "build/wasm", "wworker");
}

function copyAssets() {
    return src(['build/wasm/wworker.js',
                'build/wasm/wworker.js.symbols',
                'build/wasm/wworker.wasm'])
        .pipe(dest('dist'));
};

function js() {
    return browserify({
        debug: true,
        entries: ["server/jsdos-worker/ts/worker.ts"],
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
        .pipe(source("worker.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
};

function workerJs() {
    return src("dist/wworker.js")
        .pipe(footer(`
var module = {
    onRuntimeInitialized: function() {
        module.callMain([]);
    }
};
new WWORKER(module);
`))
        .pipe(dest("dist"));
}

export const worker = series(clean, wasm, copyAssets, js, workerJs);
