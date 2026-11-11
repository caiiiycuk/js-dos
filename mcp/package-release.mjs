import { execFileSync } from "node:child_process";
import { readFile, writeFile, readdir, mkdir, mkdtemp, cp, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const name = process.argv[2];
assert(["linux-x86_64", "windows-x86_64", "macos-x86_64", "macos-arm64"].includes(name));
assert.equal(name, ({ linux: "linux", win32: "windows", darwin: "macos" })[process.platform] + "-" + ({ x64: "x86_64", arm64: "arm64" })[process.arch]);
const output = path.resolve("mcp/release");
await mkdir(output, { recursive: true });
await mkdir(path.join(tmpdir(), "opencode"), { recursive: true });
const temporary = await mkdtemp(path.join(tmpdir(), "opencode", "jsdos-package-"));
try {
    const folder = path.join(temporary, "jsdos-mcp");
    await mkdir(folder);
    const binary = "jsdos-mcp" + (process.platform === "win32" ? ".exe" : "");
    await cp(path.resolve("mcp/target/release", binary), path.join(folder, binary));
    await cp("mcp/assets/notices", path.join(folder, "notices"), { recursive: true });
    for (const source of ["README.md", "VERIFICATION.md", "RELEASE-NOTES.md", "Cargo.lock", "sources.json"]) await cp("mcp/" + source, path.join(folder, source));
    await cp("mcp/acceptance", path.join(folder, "acceptance"), { recursive: true });
    await cp("mcp/assets/manifest.json", path.join(folder, "asset-manifest.json"));
    const target = execFileSync("rustc", ["-vV"], { encoding: "utf8" }).match(/^host: (.+)$/m)[1];
    const metadata = JSON.parse(execFileSync("cargo", ["metadata", "--locked", "--format-version", "1", "--filter-platform", target, "--manifest-path", "mcp/Cargo.toml"], { maxBuffer: 32 * 1024 * 1024 }));
    const licenses = [];
    await mkdir(path.join(folder, "notices/rust"));
    for (const dependency of metadata.packages) {
        if (!dependency.source) continue;
        const directory = path.dirname(dependency.manifest_path);
        const files = (await readdir(directory, { withFileTypes: true })).filter((entry) => /^(licenses?|licences?|copying|copyright|notice)([-.]|$)/i.test(entry.name));
        assert(files.length > 0, "Missing dependency license: " + dependency.name);
        for (const file of files) await cp(path.join(directory, file.name), path.join(folder, "notices/rust", `${dependency.name}-${dependency.version}-${file.name}`), { recursive: true });
        licenses.push({ name: dependency.name, version: dependency.version, license: dependency.license, source: dependency.source, repository: dependency.repository,
            sourceArchive: `https://crates.io/api/v1/crates/${dependency.name}/${dependency.version}/download`, includedNotices: files.map((file) => file.name) });
    }
    await writeFile(path.join(folder, "notices/rust/dependencies.json"), JSON.stringify(licenses, null, 2));
    const bytes = await readFile(path.join(folder, binary));
    const verification = JSON.parse(await readFile(path.join(output, `verification-${process.platform}-${process.arch}.json`)));
    assert(verification.status === "passed" && verification.editor && verification.mcp && verification.presets);
    assert.equal(verification.mcpBinarySha256, createHash("sha256").update(bytes).digest("hex"), "Browser checks did not use this release binary");
    await writeFile(path.join(folder, "browser-verification.json"), JSON.stringify(verification, null, 2));
    await writeFile(path.join(folder, "release.json"), JSON.stringify({ name, version: (await readFile("mcp/Cargo.toml", "utf8")).match(/^version = "(.+)"/m)[1],
        commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), binaryBytes: bytes.length,
        workingTreeDirty: execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim().length > 0,
        binarySha256: createHash("sha256").update(bytes).digest("hex"), externalResources: "sockdrive/qcow2 resources are not embedded; they require separate access" }, null, 2));
    execFileSync("tar", ["-czf", path.join(output, `jsdos-mcp-${name}.tar.gz`), "-C", temporary, "jsdos-mcp"]);
    const extracted = path.join(temporary, "extracted");
    await mkdir(extracted);
    execFileSync("tar", ["-xzf", path.join(output, `jsdos-mcp-${name}.tar.gz`), "-C", extracted]);
    assert.equal(createHash("sha256").update(await readFile(path.join(extracted, "jsdos-mcp", binary))).digest("hex"), verification.mcpBinarySha256);
    execFileSync(process.execPath, ["test/stdio.mjs", path.join(extracted, "jsdos-mcp", binary)], { stdio: "inherit" });
    const archive = await readFile(path.join(output, `jsdos-mcp-${name}.tar.gz`));
    const report = { name, binaryBytes: bytes.length, archiveBytes: archive.length, binarySha256: verification.mcpBinarySha256, archiveSha256: createHash("sha256").update(archive).digest("hex") };
    await writeFile(path.join(output, `jsdos-mcp-${name}.sha256`), `${report.archiveSha256}  jsdos-mcp-${name}.tar.gz\n`);
    console.log(JSON.stringify(report));
    if (process.env.GITHUB_ACTIONS) console.log(`::notice title=${name} release::${JSON.stringify(report)}`);
} finally { await rm(temporary, { recursive: true, force: true }); }
