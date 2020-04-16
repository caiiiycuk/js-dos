import { src, dest, series, parallel } from "gulp";
import del from "del";

import size from "gulp-size";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

// tslint:disable-next-line:no-var-requires
const tsify = require("tsify");

function clean() {
    return del(["dist/test*"], { force: true });
};

function copyAssetsTest() {
    return src(["test/*.html", "test/*.png", "test/*.zip"])
        .pipe(dest("dist/test"));
};

function js() {
    return browserify({
        debug: true,
        entries: ["test/src/test.ts"],
        cache: {},
        packageCache: {}
    })
        .plugin(tsify, {
            "target": "esnext",
            "esModuleInterop": false,
            "allowSyntheticDefaultImports": true,
            "strict": false,
            "forceConsistentCasingInFileNames": false,
            "resolveJsonModule": true,
            "isolatedModules": false
        })
        .transform("babelify", {
            presets: [["@babel/preset-env", {
                "useBuiltIns": "usage",
                "corejs": 2,
            }]],
            extensions: [".ts"]
        })
        .bundle()
        .pipe(source("test.js"))
        .pipe(buffer())
        .pipe(size({ showFiles: true, showTotal: false }))
        .pipe(dest("dist/test"));
};

export const test = series(clean, parallel(copyAssetsTest, js));
