import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import path from "node:path";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, stat, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const binary = path.resolve(process.argv[2] ?? "mcp/target/release/jsdos-mcp" + (process.platform === "win32" ? ".exe" : ""));
await mkdir(path.join(tmpdir(), "opencode"), { recursive: true });
const temporary = await mkdtemp(path.join(tmpdir(), "opencode", "jsdos-stdio-"));
const child = spawn(binary, [], { env: { ...process.env, PATH: "", BROWSER: "", XDG_CURRENT_DESKTOP: "jsdos-test-no-desktop", DESKTOP_SESSION: "" }, stdio: ["pipe", "pipe", "pipe"] });
const pending = new Map();
let next = 0;
let stderr = "";
child.stderr.on("data", (data) => stderr += data);
createInterface({ input: child.stdout }).on("line", (line) => {
    const response = JSON.parse(line);
    assert(!response.error, line);
    pending.get(response.id)?.(response.result);
    pending.delete(response.id);
});
function rpc(method, params = {}) {
    return new Promise((resolve, reject) => {
        const id = ++next;
        const timeout = setTimeout(() => reject(new Error("MCP handshake timeout")), 15000);
        pending.set(id, (result) => { clearTimeout(timeout); resolve(result); });
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    });
}
try {
    await rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "release-smoke-test", version: "1" } });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
    const tools = await rpc("tools/list");
    assert.equal(tools.tools.length, 8);
    assert(tools.tools.every((tool) => tool.inputSchema.type === "object"));
    const studio = JSON.parse((await rpc("tools/call", { name: "studio", arguments: { open_browser: process.platform === "linux" } })).content[0].text);
    if (process.platform === "linux") assert.equal(typeof studio.openError, "string");
    const url = new URL(studio.url);
    const second = spawn(binary, [], { env: { ...process.env, PATH: "" }, stdio: ["pipe", "pipe", "ignore"] });
    try {
        const lines = createInterface({ input: second.stdout })[Symbol.asyncIterator]();
        second.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "isolation-test", version: "1" } } }) + "\n");
        assert(!JSON.parse((await lines.next()).value).error);
        second.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
        second.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "studio", arguments: {} } }) + "\n");
        const other = new URL(JSON.parse(JSON.parse((await lines.next()).value).result.content[0].text).url);
        assert.notEqual(other.origin, url.origin);
        assert.notEqual(other.hash, url.hash);
        second.stdin.end();
        assert.equal(await new Promise((resolve) => second.once("exit", resolve)), 0);
        await assert.rejects(fetch(other.origin));
        assert.equal((await fetch(url.origin)).status, 200);
    } finally { if (second.exitCode === null) second.kill(); }
    const source = path.join(temporary, "source");
    await mkdir(path.join(source, ".jsdos"), { recursive: true });
    await writeFile(path.join(source, ".jsdos/dosbox.conf"), "[autoexec]\necho GENERATED\n");
    for (const preset of ["html", "vite", "react", "vue", "angular"]) {
        const generated = await rpc("tools/call", { name: "generate", arguments: { source, preset, destination: path.join(temporary, preset) } });
        assert(!generated.isError, JSON.stringify(generated));
        assert.equal(JSON.parse(generated.content[0].text).buildStatus, "not-run");
        await assert.rejects(stat(path.join(temporary, preset, "node_modules")));
    }
    const unknown = await rpc("tools/call", { name: "generate", arguments: { source, preset: "unknown", destination: path.join(temporary, "unknown") } });
    assert(unknown.isError);
    await writeFile(path.join(source, ".jsdos/dosbox.conf"), "[autoexec]\nsockdrive external-resource\n");
    const external = await rpc("tools/call", { name: "generate", arguments: { source, preset: "html", destination: path.join(temporary, "external") } });
    assert.equal(JSON.parse(external.content[0].text).warnings.externalResources, true);
    child.stdin.end();
    assert.equal(await new Promise((resolve) => child.once("exit", resolve)), 0);
    await assert.rejects(fetch(url.origin));
    assert((await stat(path.join(temporary, "html/runtime/emulators/wdosbox.wasm"))).isFile());
    assert(!stderr.includes(url.hash.slice(1)));
    console.log(JSON.stringify({ suite: "release-stdio", platform: process.platform, arch: process.arch, tools: tools.tools.length, status: "passed", childPath: "empty", isolatedProcesses: 2 }));
} finally {
    if (child.exitCode === null) child.kill();
    await rm(temporary, { recursive: true, force: true });
}
