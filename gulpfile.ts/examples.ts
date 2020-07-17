import { src, dest, series, parallel } from "gulp";
import del from "del";

import size from "gulp-size";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import source from "vinyl-source-stream";

function clean() {
    return del(["examples/js-dos/*"], { force: true });
};

function copyJsDos() {
    return src(["dist/*"])
        .pipe(dest("examples/js-dos/"));
};


export const examples = series(clean, copyJsDos);
