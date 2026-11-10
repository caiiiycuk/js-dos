import { build } from "vite";
import preact from "@preact/preset-vite";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFile, mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir, release } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert/strict";
import { testMcp } from "./mcp.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const verificationFile = path.join(root, `mcp/release/verification-${process.platform}-${process.arch}.json`);
await mkdir(path.dirname(verificationFile), { recursive: true });
await writeFile(verificationFile, JSON.stringify({ at: new Date().toISOString(), status: "running" }));
const output = await build({
    configFile: false, root, publicDir: false, plugins: [preact()],
    define: { JSDOS_VERSION: JSON.stringify("test"), "process.env.NODE_ENV": JSON.stringify("production") },
    build: { write: false, minify: false, lib: { entry: path.join(root, "test/editor.ts"), name: "Tests", formats: ["iife"] } },
});
const script = output[0].output.find((entry) => entry.type === "chunk").code;
const server = createServer(async (request, response) => {
    try {
        const pathname = new URL(request.url, "http://localhost").pathname;
        response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        response.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        if (pathname === "/") {
            response.setHeader("Content-Type", "text/html");
            response.end('<!doctype html><body><script src="/test.js" defer></script></body>');
        } else if (pathname === "/test.js") {
            response.setHeader("Content-Type", "text/javascript");
            response.end(script);
        } else if (pathname === "/fixture.conf") {
            response.end(await readFile(path.join(root, "test/fixtures/dosbox.conf")));
        } else if (/^\/emulators\/[a-z0-9.-]+$/.test(pathname)) {
            response.setHeader("Content-Type", pathname.endsWith(".wasm") ? "application/wasm" : "text/javascript");
            response.end(await readFile(pathname === "/emulators/emulators.js" && process.env.JSDOS_TEST_EMULATORS_JS ?
                process.env.JSDOS_TEST_EMULATORS_JS : path.join(root, "mcp/assets", pathname)));
        } else {
            response.writeHead(404).end();
        }
    } catch {
        response.writeHead(404).end();
    }
});
const proxy = createServer((_request, response) => response.writeHead(403).end());
proxy.on("connect", (_request, connection) => connection.destroy());
await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
await mkdir(path.join(tmpdir(), "opencode"), { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "opencode", "jsdos-test-"));
const chrome = spawn(process.env.CHROME ?? "google-chrome", [
    "--proxy-server=http://127.0.0.1:" + proxy.address().port,
    "--proxy-bypass-list=<-loopback>;127.0.0.1;localhost", "--disable-quic",
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0",
    "--remote-debugging-address=127.0.0.1", "--no-first-run", `--user-data-dir=${profile}`, "about:blank",
], { stdio: ["ignore", "ignore", "pipe"] });
let socket;
try {
    const debuggerUrl = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Chrome debugger did not start")), 15000);
        chrome.once("error", reject);
        let stderr = "";
        chrome.stderr.on("data", (data) => {
            stderr += data;
            const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
            if (match) { clearTimeout(timeout); resolve(match[1]); }
        });
    });
    socket = new WebSocket(debuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pending = new Map();
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.method === "Runtime.exceptionThrown") console.error(JSON.stringify(message.params));
        if (message.method === "Runtime.consoleAPICalled") console.log(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
        if (message.id) {
            const callback = pending.get(message.id);
            pending.delete(message.id);
            callback?.(message);
        }
    };
    function call(method, params = {}, sessionId) {
        return new Promise((resolve, reject) => {
            const current = ++id;
            const timeout = setTimeout(() => { pending.delete(current); reject(new Error("CDP timeout: " + method)); }, 120000);
            pending.set(current, (message) => {
                clearTimeout(timeout);
                if (message.error) reject(new Error(JSON.stringify(message.error)));
                else resolve(message.result);
            });
            socket.send(JSON.stringify({ id: current, method, params, sessionId }));
        });
    }
    for (const backend of process.argv.includes("--mcp-only") ? [] : ["dosbox", "dosboxX"]) {
        const { targetId } = await call("Target.createTarget", { url: "about:blank" });
        const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
        await call("Network.enable", {}, sessionId);
        await call("Runtime.enable", {}, sessionId);
        await call("Network.setBlockedURLs", { urls: ["https://*", "http://v8.js-dos.com/*", "http://br.cdn.dos.zone/*"] }, sessionId);
        await call("Page.navigate", { url: `http://127.0.0.1:${server.address().port}/?backend=${backend}` }, sessionId);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await call("Runtime.evaluate", {
            expression: "new Promise(resolve => { const deadline = Date.now() + 90000; const wait = () => window.tests ? window.tests.then(resolve) : Date.now() > deadline ? resolve({status:'failed',error:'Test script did not initialize'}) : setTimeout(wait, 20); wait(); })",
            awaitPromise: true, returnByValue: true,
        }, sessionId);
        console.log(JSON.stringify(result.result.value));
        if (result.result.value?.status !== "passed") {
            const match = result.result.value?.stack?.match(/async test \([^:]+:\/\/[^/]+\/test.js:(\d+)/);
            if (match) console.error(script.split("\n").slice(Number(match[1]) - 3, Number(match[1]) + 2).join("\n"));
        }
        assert.equal(result.result.value?.status, "passed", JSON.stringify(result));
        await call("Target.closeTarget", { targetId });
    }
    if (process.argv.includes("--mcp")) await testMcp(call);
    const binary = process.env.JSDOS_MCP_BINARY ?? path.join(root, "mcp/target/debug/jsdos-mcp" + (process.platform === "win32" ? ".exe" : ""));
    await writeFile(verificationFile, JSON.stringify({
        at: new Date().toISOString(), platform: process.platform, arch: process.arch, osRelease: release(),
        browser: await call("Browser.getVersion"), status: process.env.JSDOS_TEST_EMULATORS_JS ? "development-sdk" : "passed", editor: !process.argv.includes("--mcp-only"),
        emulatorsOverrideSha256: process.env.JSDOS_TEST_EMULATORS_JS ? createHash("sha256").update(await readFile(process.env.JSDOS_TEST_EMULATORS_JS)).digest("hex") : null,
        mcp: process.argv.includes("--mcp"), presets: process.argv.includes("--presets"),
        mcpBinarySha256: process.argv.includes("--mcp") ? createHash("sha256").update(await readFile(binary)).digest("hex") : null,
        network: "External HTTP(S) denied by loopback proxy; runtime assets served locally",
    }, null, 2));
} catch (error) {
    await writeFile(verificationFile, JSON.stringify({ at: new Date().toISOString(), status: "failed" }));
    throw error;
} finally {
    socket?.close();
    await new Promise((resolve) => {
        if (chrome.exitCode !== null) resolve();
        else { chrome.once("close", resolve); chrome.kill("SIGTERM"); }
    });
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => proxy.close(resolve));
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
