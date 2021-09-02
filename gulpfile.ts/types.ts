import del from "del";
import { execute } from "./execute";

import { series } from "gulp";

function clean() {
    return del(["dist/types"], { force: true });
}

async function types() {
    await execute("./node_modules/.bin/tsc", "--emitDeclarationOnly", "--declaration",
            "src/js-dos-player.ts", "--outDir", "dist/types");
}

export const emitTypes = series(clean, types);
