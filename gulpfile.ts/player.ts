import { dest } from "gulp";

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
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist"));
}

