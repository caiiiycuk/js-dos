import { src, dest, series } from "gulp";
import del from "del";
import rename from "gulp-rename";
const concat = require("gulp-concat");

function clean() {
    return del(["dist/*"], { force: true });
}

function copyCss() {
    return src("node_modules/emulators-ui/dist/emulators-ui.css")
        .pipe(rename("js-dos.css"))
        .pipe(dest("dist"));
}

function copyWasm() {
    return src([
        "node_modules/emulators/dist/wdirect.js",
        "node_modules/emulators/dist/wdirect.js.symbols",
        "node_modules/emulators/dist/wdirect.wasm",
        "node_modules/emulators/dist/wworker.js",
        "node_modules/emulators/dist/wworker.js.symbols",
        "node_modules/emulators/dist/wworker.wasm",
    ]).pipe(dest("dist"));
}

function concatJs() {
    return src([
        "node_modules/emulators-ui/dist/emulators-ui.js",
        "node_modules/emulators/dist/emulators.js",
    ])
        .pipe(concat("js-dos.js"))
        .pipe(dest("dist"));
}

export const jsdos = series(clean, concatJs, copyCss, copyWasm);
