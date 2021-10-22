import { dest } from "gulp";

import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import size from "gulp-size";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// eslint-disable-next-line
const tsify = require("tsify");

export function playerJs() {
    return browserify({
        debug: true,
        entries: ["src/player.ts"],
        cache: {},
        packageCache: {},
    })
        .plugin(tsify, {
            "target": "esnext",
        })
        .transform("babelify", {
            presets: [["@babel/preset-env", {
                "useBuiltIns": "usage",
                "corejs": 3,
            }]],
            extensions: [".ts"],
            sourceMaps: true,
        })
        .bundle()
        .pipe(source("player.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(terser())
        .pipe(sourcemaps.write("./"))
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

