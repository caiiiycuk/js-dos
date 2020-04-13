import * as process from "process";
import * as fs from "fs-extra";
import * as path from "path";
import { execute } from "./execute";

export default async function make(listsPath: string, buildPath: string) {
    listsPath = path.resolve(listsPath);
    buildPath = path.resolve(buildPath);
    const cwd = path.resolve(process.cwd());

    process.chdir(buildPath);
    if (!fs.existsSync(buildPath)) {
        await emcmake(listsPath, buildPath);
    }

    await ninjaBuild();
    process.chdir(cwd);
}

async function ninjaBuild() {
    await execute("ninja", "-j4");
}

async function emcmake(listsPath: string, buildPath: string) {
    fs.ensureDirSync(buildPath);
    await execute("emcmake", "cmake", "-GNinja", listsPath);
}
