import { src, dest, series } from "gulp";
import del from "del";
import make from "./cmake";

function clean() {
    return del(["dist/wlibzip*"], { force: true });
};

async function wasm() {
    await make(".", "build/wasm", "wlibzip");
};

function copyAssets() {
    return src(['build/wasm/wlibzip.js',
                'build/wasm/wlibzip.js.symbols',
                'build/wasm/wlibzip.wasm'])
        .pipe(dest('dist'));
};

export const libzip = series(clean, wasm, copyAssets);
