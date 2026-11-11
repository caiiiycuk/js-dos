import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, writeFile, stat, readdir } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createInterface } from "node:readline";
import { once } from "node:events";

function command(args, directory) {
    const env = { ...process.env, NODE_ENV: args[1] === "build" ? "production" : "development" };
    return process.platform === "win32" ? spawn("cmd.exe", ["/d", "/s", "/c", "npm " + args.join(" ")], { cwd: directory, env, stdio: ["ignore", "pipe", "pipe"] }) :
        spawn("npm", args, { cwd: directory, env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
}
async function run(args, directory) {
    const child = command(args, directory);
    let output = "";
    child.stdout.on("data", (data) => output += data);
    child.stderr.on("data", (data) => output += data);
    const timeout = setTimeout(() => terminate(child), 180000);
    const code = await new Promise((resolve, reject) => { child.once("close", resolve); child.once("error", reject); });
    clearTimeout(timeout);
    assert.equal(code, 0, output);
    return output;
}
async function freePort() {
    const reserve = createServer();
    await new Promise((resolve) => reserve.listen(0, "127.0.0.1", resolve));
    const port = reserve.address().port;
    await new Promise((resolve) => reserve.close(resolve));
    return port;
}
async function terminate(child) {
    const closed = child.exitCode === null && child.signalCode === null ?
        once(child, "close", { signal: AbortSignal.timeout(10000) }) : null;
    if (process.platform === "win32") spawnSync("taskkill.exe", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    else { try { process.kill(-child.pid, "SIGKILL"); } catch {} }
    await closed;
}
async function serve(directory) {
    const server = createServer(async (request, response) => {
        try {
            const name = new URL(request.url, "http://localhost").pathname;
            const selected = path.join(directory, name === "/" ? "index.html" : name);
            assert(selected.startsWith(directory));
            const mime = selected.endsWith(".html") ? "text/html" : selected.endsWith(".js") ? "text/javascript" : selected.endsWith(".css") ? "text/css" : selected.endsWith(".wasm") ? "application/wasm" : "application/octet-stream";
            response.setHeader("Content-Type", mime);
            response.end(await readFile(selected));
        } catch { response.writeHead(404).end(); }
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    return { url: "http://127.0.0.1:" + server.address().port, stop: () => new Promise((resolve) => server.close(resolve)) };
}
const observe = `
window.__players=[];window.__liveCis=0;window.__ws=[];let createDos;
window.__audioContexts=[];const AudioContextOriginal=window.AudioContext;
window.AudioContext=class extends AudioContextOriginal{constructor(...args){super(...args);window.__audioContexts.push(this)}};
window.__errors=[];window.addEventListener('error',event=>window.__errors.push(event.message));window.addEventListener('unhandledrejection',event=>window.__errors.push(String(event.reason)));
const WebSocketOriginal=window.WebSocket;
window.WebSocket=class extends WebSocketOriginal{constructor(url,...args){window.__ws.push(String(url));super(url,...args)}};
Object.defineProperty(window,'Dos',{configurable:true,get:()=>createDos,set(value){createDos=(element,options)=>{
const player=value(element,{...options,onEvent(event,ci){if(event==='ci-ready'){window.__liveCis++;ci.events().onExit(()=>window.__liveCis--)}options.onEvent?.(event,ci)}});
window.__players.push(player);return player}}});`;

async function browser(call, url, lifecycle = false) {
    const { targetId } = await call("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
    try {
        await call("Network.enable", {}, sessionId);
        await call("Page.enable", {}, sessionId);
        await call("Runtime.enable", {}, sessionId);
        await call("Page.addScriptToEvaluateOnNewDocument", { source: observe }, sessionId);
        await call("Network.setBlockedURLs", { urls: ["https://*"] }, sessionId);
        await call("Page.navigate", { url }, sessionId);
        const evaluate = async (expression) => {
            const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, sessionId);
            assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
            return result.result.value;
        };
        const wait = async (expression) => {
            const result = await evaluate(`new Promise(resolve=>{const end=Date.now()+45000;const check=()=>(${expression})?resolve(true):Date.now()>end?resolve(false):setTimeout(check,40);check()})`);
            assert(result, "Preset browser condition failed: " + expression);
        };
        await wait("(window.__players??[]).some(player=>player.editor.state().ready)");
        await wait("window.__liveCis===1");
        assert.equal(await evaluate("window.__ws.some(url=>url.includes('/bridge')||url.includes('__jsdos_events'))"), false);
        if (lifecycle) {
            await evaluate("window.__unmount()");
            await wait("window.__liveCis===0");
            await wait("window.__audioContexts.length>0&&window.__audioContexts.every(context=>context.state==='closed')");
            await evaluate("Promise.resolve(window.__mount()).then(()=>true)");
            await wait("window.__liveCis===1");
            await wait("window.__audioContexts.filter(context=>context.state!=='closed').length===1");
            await evaluate("window.__unmount()");
            await wait("window.__liveCis===0");
            await wait("window.__audioContexts.every(context=>context.state==='closed')");
        }
        assert.deepEqual(await evaluate("window.__errors"), []);
    } finally { await call("Target.closeTarget", { targetId }); }
}
function lifecycleSource(preset, source) {
    if (preset === "react") return source.replace('createRoot(document.getElementById("app")).render(<StrictMode><Player /></StrictMode>);',
        'let root;window.__mount=()=>{root=createRoot(document.getElementById("app"));root.render(<StrictMode><Player /></StrictMode>)};window.__unmount=()=>root.unmount();window.__mount();');
    if (preset === "vue") return source.replace("createApp({", "window.__mount=()=>{window.__app=createApp({").replace('}).mount("#app");', '});window.__app.mount("#app")};window.__unmount=()=>window.__app.unmount();window.__mount();');
    return source.replace("bootstrapApplication(Player).catch(console.error);", 'let app:any;(window as any).__mount=()=>{if(!document.querySelector("app-root"))document.body.append(document.createElement("app-root"));return bootstrapApplication(Player).then(value=>app=value)};(window as any).__unmount=()=>app.destroy();(window as any).__mount();');
}
async function noControl(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) await noControl(file);
        else if (/\.(html|js)$/.test(entry.name)) {
            const content = await readFile(file, "utf8");
            assert(!content.includes("__jsdos_diagnostics") && !content.includes("__jsdos_events") && !content.includes("jsdos-diagnostics-unhandled") && !content.includes('"/bridge"'), "Control code in production: " + file);
        }
    }
}

export async function testPresets(call, root) {
    for (const preset of ["html", "vite", "react", "vue", "angular"]) {
        const directory = path.join(root, preset);
        if (preset === "html") {
            const original = await readFile(path.join(directory, "index.html"), "utf8");
            await writeFile(path.join(directory, "index.html"), original.replace(/<script>throw new Error\("INTENTIONAL_ERROR"\)<\/script><script>Promise.reject\("INTENTIONAL_REJECTION"\)<\/script><script src="\.\/missing-resource.js"><\/script>/, ""));
            const server = await serve(directory);
            try { await browser(call, server.url); } finally { await server.stop(); }
            console.log(JSON.stringify({ preset, status: "passed", nodeRequired: false }));
            continue;
        }
        await run(["install", "--include=dev", "--ignore-scripts", "--no-audit", "--no-fund"], directory);
        const sourceName = preset === "react" ? "main.jsx" : preset === "angular" ? "main.ts" : "main.js";
        const source = await readFile(path.join(directory, sourceName), "utf8");
        const lifecycle = ["react", "vue", "angular"].includes(preset);
        if (lifecycle) await writeFile(path.join(directory, sourceName), lifecycleSource(preset, source));
        const port = await freePort();
        const dev = command(["run", "dev", "--", "--port", String(port)], directory);
        let output = "";
        dev.stdout.on("data", (data) => output += data);
        dev.stderr.on("data", (data) => output += data);
        const url = "http://127.0.0.1:" + port;
        try {
            const deadline = Date.now() + 60000;
            while (!(await fetch(url).catch(() => null))?.ok) {
                assert(dev.exitCode === null && Date.now() < deadline, output);
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            await browser(call, url, lifecycle);
        } finally {
            await terminate(dev);
            if (lifecycle) await writeFile(path.join(directory, sourceName), source);
        }
        if (preset === "vite" || preset === "angular") await diagnosticPreview(call, directory, preset);
        await run(["run", "build"], directory);
        const outputDirectory = path.join(directory, preset === "angular" ? "dist/player/browser" : "dist");
        await stat(path.join(outputDirectory, "runtime/emulators/wdosbox-x.wasm"));
        await noControl(outputDirectory);
        const server = await serve(outputDirectory);
        try { await browser(call, server.url); } finally { await server.stop(); }
        console.log(JSON.stringify({ preset, status: "passed", checks: ["dev", "build", "production", ...(lifecycle ? ["remount"] : [])] }));
    }
}

async function diagnosticPreview(call, directory, preset) {
    const port = await freePort();
    const upstream = "http://127.0.0.1:" + port;
    const dev = command(["run", "dev", "--", "--port", String(port), ...(preset === "vite" ? ["--mode", "diagnostic"] : ["--configuration", "diagnostic"])], directory);
    let output = "";
    dev.stdout.on("data", (data) => output += data);
    dev.stderr.on("data", (data) => output += data);
    const child = spawn(process.env.JSDOS_MCP_BINARY ?? path.resolve("mcp/target/debug/jsdos-mcp" + (process.platform === "win32" ? ".exe" : "")), [], { stdio: ["pipe", "pipe", "ignore"] });
    const lines = createInterface({ input: child.stdout })[Symbol.asyncIterator]();
    let id = 0;
    let targetId;
    async function rpc(method, params) {
        const current = ++id;
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: current, method, params }) + "\n");
        for (;;) {
            const line = await lines.next();
            assert(!line.done, "Diagnostic MCP exited");
            const response = JSON.parse(line.value);
            if (response.id !== current) continue;
            assert(!response.error, JSON.stringify(response.error));
            return response.result;
        }
    }
    async function preview(args) {
        const result = await rpc("tools/call", { name: "preview_project", arguments: args });
        assert(!result.isError, JSON.stringify(result));
        return JSON.parse(result.content[0].text);
    }
    try {
        const available = Date.now() + 60000;
        while (!(await fetch(upstream).catch(() => null))?.ok) {
            assert(dev.exitCode === null && Date.now() < available, output);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "diagnostic-preview-test", version: "1" } });
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
        const started = await preview({ operation: "start", directory, upstream });
        assert.equal(started.browser.status, "not-run");
        ({ targetId } = await call("Target.createTarget", { url: "about:blank" }));
        const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
        await call("Network.enable", {}, sessionId);
        await call("Network.setBlockedURLs", { urls: ["https://*"] }, sessionId);
        await call("Page.navigate", { url: started.url }, sessionId);
        const deadline = Date.now() + 30000;
        while (!(await preview({ operation: "report" })).browser.events.some((event) => event.type === "jsdos-created")) {
            assert(Date.now() < deadline, "Diagnostic module missed player initialization");
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await call("Runtime.evaluate", { expression: `setTimeout(()=>{throw new Error('PREVIEW_ERROR')}); void Promise.reject('PREVIEW_REJECTION');
            const script=document.createElement('script');script.src='/missing-test-resource.js';document.head.append(script);
            window.__broken=Dos(document.body.appendChild(document.createElement('div')),{url:'./broken.jsdos',pathPrefix:new URL('./runtime/emulators/',location.href).href});` }, sessionId);
        for (;;) {
            const report = await preview({ operation: "report" });
            if (["error", "unhandledrejection", "resource-error", "jsdos-error"].every((type) => report.browser.events.some((event) => event.type === type))) break;
            if (Date.now() >= deadline) {
                const state = await call("Runtime.evaluate", { expression: "window.__broken.editor.state()", returnByValue: true }, sessionId);
                assert.fail("Missing diagnostic events: " + JSON.stringify({ events: report.browser.events, state: state.result.value }));
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        await call("Target.closeTarget", { targetId }); targetId = null;
        await preview({ operation: "stop" });
        child.stdin.end();
        assert.equal(await new Promise((resolve) => child.once("exit", resolve)), 0);
    } finally {
        await terminate(dev);
        if (targetId) await call("Target.closeTarget", { targetId });
        if (child.exitCode === null) child.kill();
    }
}
