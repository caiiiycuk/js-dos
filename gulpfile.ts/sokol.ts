import { src, dest, series } from "gulp";
import del from "del";

import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import size from "gulp-size";
import rename from "gulp-rename";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import generateBuildInfo from "./build-info";

import make from "./cmake";

// tslint:disable-next-line:no-var-requires
const tsify = require("tsify");
// tslint:disable-next-line:no-var-requires
const footer = require("gulp-footer");

function clean() {
    return del(["dist/jsdos-sokol*",
                "dist/wsokol*",
                "server/jsdos-sokol/src/jsdos-sokol-build.ts"], { force: true });
};

async function wasm() {
    await make(".", "build/wasm", "wsokol", "wsokol-client");
}

function generateBuildTs(cb: () => void) {
    generateBuildInfo("build/wasm/wsokol.js",
                      "build/wasm/wsokol.wasm",
                      "server/jsdos-sokol/src/jsdos-sokol-build.ts");
    cb();
};

function copyAssets() {
    return src(['build/wasm/wsokol.js',
                'build/wasm/wsokol.js.symbols',
                'build/wasm/wsokol.wasm',
                'build/wasm/wsokol-client.js',
                'build/wasm/wsokol-client.js.symbols',
                'build/wasm/wsokol-client.wasm'])
        .pipe(dest('dist'));
};

function js() {
    return browserify({
        debug: true,
        entries: ["server/jsdos-sokol/src/jsdos-sokol.ts"],
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
        .pipe(source("jsdos-sokol.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
};

function workerJs() {
    return src("dist/wsokol.js")
        .pipe(footer(`
var module = {
    onRuntimeInitialized: function() {
        console.log("worker runtime is ready");
        module.callMain([]);
    }
};
new WSOKOL(module);
`))
        .pipe(rename("wsokol-worker.js"))
        .pipe(dest("dist"));
}

export const sokol = series(clean, wasm, copyAssets, generateBuildTs, js, workerJs);
