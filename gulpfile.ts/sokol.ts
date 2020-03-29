import { src, dest, series } from "gulp";
import del from "del";

import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import size from "gulp-size";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

import generateBuildInfo from "./build-info";

// tslint:disable-next-line:no-var-requires
const tsify = require("tsify");

function clean() {
    return del(["dist/jsdos-sokol*",
                "dist/wsokol*",
                "client/jsdos-sokol/src/jsdos-sokol-build.ts"], { force: true });
};

function generateBuildTs(cb: () => void) {
    generateBuildInfo("client/jsdos-sokol/build/wsokol.js",
                      "client/jsdos-sokol/build/wsokol.wasm",
                      "client/jsdos-sokol/src/jsdos-sokol-build.ts");
    cb();
};

function copyAssets() {
    return src(['client/jsdos-sokol/build/wsokol.js',
                'client/jsdos-sokol/build/wsokol.js.symbols',
                'client/jsdos-sokol/build/wsokol.wasm'])
        .pipe(dest('dist'));
};

function js() {
    return browserify({
        debug: true,
        entries: ["client/jsdos-sokol/src/jsdos-sokol.ts"],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
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

export const sokol = series(clean, copyAssets, generateBuildTs, js);
