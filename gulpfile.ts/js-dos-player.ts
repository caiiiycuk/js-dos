import * as fs from "fs";

import { src, dest, series } from "gulp";

import del from "del";

import sourcemaps from "gulp-sourcemaps";
import uglify from "gulp-uglify";
import size from "gulp-size";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// eslint-disable-next-line
const tsify = require("tsify");

export function playerJs() {
    return browserify({
        debug: true,
        entries: ["src/js-dos-player.ts"],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            "target": "esnext",
        })
        .transform("babelify", {
            presets: [["@babel/preset-env", {
                "useBuiltIns": "usage",
                "corejs": 3,
            }]],
            extensions: [".ts"]
        })
        .bundle()
        .pipe(source("player.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

