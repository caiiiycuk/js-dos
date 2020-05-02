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
    return del(["dist/direct*",
                "dist/wdirect*"], { force: true });
};

async function wasm() {
    await make(".", "build/wasm", "wdirect");
}

function copyAssets() {
    return src(['build/wasm/wdirect.js',
                'build/wasm/wdirect.js.symbols',
                'build/wasm/wdirect.wasm'])
        .pipe(dest('dist'));
};

function js() {
    return browserify({
        debug: true,
        entries: ["server/jsdos-direct/ts/direct.ts"],
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
        .pipe(source("direct.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
};

export const direct = series(clean, wasm, copyAssets, js);
