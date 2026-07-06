#!/usr/bin/env node
/**
 * Build step: turn every game folder under the repo's `dos/` directory into a
 * static `.jsdos` bundle that the Worker serves.
 *
 * Reads   <repo>/dos/<game>/...
 * Writes  <repo>/worker/public/games/<game>.jsdos
 *         <repo>/worker/public/games.json   (index consumed by the Worker)
 *
 * Run automatically before `wrangler deploy` / `wrangler dev` (see package.json).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EXECUTABLE_EXTS, buildBundle } from "../src/jsdos.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const dosDir = path.join(repoRoot, "dos");
const outDir = path.join(repoRoot, "worker", "public", "games");
const indexFile = path.join(repoRoot, "worker", "public", "games.json");

/** Recursively collect files under `dir`, keyed by path relative to `dir`. */
async function collectFiles(dir, base = dir) {
    const out = {};
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
        return out;
    }
    for (const entry of entries) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            Object.assign(out, await collectFiles(abs, base));
        } else if (entry.isFile()) {
            const rel = path.relative(base, abs).split(path.sep).join("/");
            out[rel] = new Uint8Array(await fs.readFile(abs));
        }
    }
    return out;
}

function hasRootExecutable(files) {
    return Object.keys(files).some(
        (p) => !p.includes("/") && EXECUTABLE_EXTS.includes(path.extname(p).toLowerCase()),
    );
}

async function main() {
    await fs.mkdir(outDir, { recursive: true });

    let gameDirs = [];
    try {
        const entries = await fs.readdir(dosDir, { withFileTypes: true });
        gameDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
    } catch {
        console.log(`No dos/ directory at ${dosDir} — nothing to build.`);
    }

    const index = [];
    for (const name of gameDirs) {
        const files = await collectFiles(path.join(dosDir, name));
        if (Object.keys(files).length === 0) {
            continue;
        }
        if (!hasRootExecutable(files)) {
            console.warn(`  skip ${name}: no .exe/.com/.bat at the folder root`);
            continue;
        }
        const { zip, exe } = buildBundle(files, name);
        const file = `${name}.jsdos`;
        await fs.writeFile(path.join(outDir, file), zip);
        index.push({ name, file, exe, size: zip.byteLength });
        console.log(`  built ${file}  (runs ${exe}, ${(zip.byteLength / 1024).toFixed(0)} KB)`);
    }

    await fs.writeFile(indexFile, JSON.stringify(index, null, 2) + "\n");
    console.log(`\nWrote ${index.length} bundle(s) and games.json`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
