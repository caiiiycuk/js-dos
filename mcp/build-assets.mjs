import { build } from "vite";
import preact from "@preact/preset-vite";
import { createRequire } from "node:module";
import { copyFile, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "mcp/assets");
const pkg = JSON.parse(await readFile(path.join(root, "package.json")));
const require = createRequire(import.meta.url);
const dependencies = new Set([path.join(root, "node_modules/daisyui"), path.join(root, "node_modules/tailwindcss")]);
await build({
    configFile: false,
    root,
    publicDir: false,
    css: { postcss: { plugins: [require("postcss-import")(), require("tailwindcss/nesting")(),
        require("tailwindcss")({ ...require("../tailwind.config.cjs"), content: [path.join(root, "src/**/*.{js,ts,jsx,tsx}"), path.join(root, "mcp/studio/index.html")] }),
        require("autoprefixer")()] } },
    plugins: [preact(), {
        name: "bundled-license-sources",
        generateBundle() {
            for (let id of this.getModuleIds()) {
                id = id.replaceAll("\0", "");
                const index = id.lastIndexOf("/node_modules/");
                if (index < 0) continue;
                const parts = id.slice(index + 14).split("/");
                dependencies.add(id.slice(0, index + 14) + parts.slice(0, parts[0].startsWith("@") ? 2 : 1).join("/"));
            }
        },
    }],
    define: { JSDOS_VERSION: JSON.stringify(pkg.version), "process.env.NODE_ENV": JSON.stringify("production") },
    build: {
        outDir: output,
        emptyOutDir: true,
        lib: { entry: path.join(root, "src/main.tsx"), name: "JsDos", formats: ["iife"], fileName: () => "js-dos.js" },
        rollupOptions: { output: { assetFileNames: (asset) => asset.name === "style.css" ? "js-dos.css" : "[name][extname]" } },
    },
});
await mkdir(path.join(output, "emulators"));
for (const file of ["emulators.js", "wdosbox.js", "wdosbox.wasm", "wdosbox-x.js", "wdosbox-x.wasm", "wlibzip.js", "wlibzip.wasm"]) {
    await copyFile(path.join(root, "node_modules/emulators/dist", file), path.join(output, "emulators", file));
}
for (const file of ["index.html", "studio.js"]) {
    await copyFile(path.join(root, "mcp/studio", file), path.join(output, file));
}
await mkdir(path.join(output, "notices"));
await copyFile(path.join(root, "node_modules/emulators/LICENSE"), path.join(output, "notices/emulators-LICENSE"));
await copyFile(path.join(root, "mcp/notices/libzip-LICENSE"), path.join(output, "notices/libzip-LICENSE"));
await copyFile(path.join(root, "mcp/sources.json"), path.join(output, "notices/sources.json"));
let notices = "";
for (const directory of [...dependencies].sort()) {
    const dependency = JSON.parse(await readFile(path.join(directory, "package.json")));
    notices += `\n${dependency.name} ${dependency.version} (${dependency.license})\n`;
    const licenses = (await readdir(directory)).filter((name) => /^(license|licence|copying|notice)(\.|$)/i.test(name));
    if (licenses.length === 0) throw new Error("Missing license text: " + dependency.name);
    for (const license of licenses) notices += await readFile(path.join(directory, license), "utf8") + "\n";
}
await writeFile(path.join(output, "notices/THIRD-PARTY.txt"), notices);
await writeFile(path.join(output, "notices/SOURCES.txt"),
    `js-dos ${pkg.version}: https://github.com/caiiiycuk/js-dos (GPL-2.0)\n` +
    `emulators ${pkg.devDependencies.emulators}: https://github.com/js-dos/emulators (GPL-2.0)\n` +
    "Exact emulators/DOSBox/DOSBox-X/libzip source revisions are in sources.json. Clone emulators at that commit and initialize its pinned submodules recursively.\n" +
    "The GPL-2.0 text in emulators-LICENSE also applies to js-dos. Release source includes js-dos, mcp, yarn.lock and Cargo.lock at the release tag.\n");
const files = [];
async function collect(directory, prefix = "") {
    for (const entry of (await readdir(directory, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name))) {
        const name = prefix + entry.name;
        if (entry.isDirectory()) {
            await collect(path.join(directory, entry.name), name + "/");
        } else {
            const bytes = await readFile(path.join(directory, entry.name));
            files.push({ path: name, size: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"), runtime: name !== "index.html" && name !== "studio.js" });
        }
    }
}
await collect(output);
await writeFile(path.join(output, "manifest.json"), JSON.stringify({ jsdos: pkg.version, emulators: pkg.devDependencies.emulators, files }, null, 2));
