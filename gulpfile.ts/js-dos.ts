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
        "node_modules/emulators/dist/wdosbox.js",
        "node_modules/emulators/dist/wdosbox.js.symbols",
        "node_modules/emulators/dist/wdosbox.wasm",
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

function copyAssets() {
    return src("node_modules/emulators-ui/dist/emulators-ui-loader.gif")
        .pipe(dest("dist"));
}

export const jsdos = series(clean, concatJs, copyCss, copyWasm, copyAssets);
