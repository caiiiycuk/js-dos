import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { readFile, mkdtemp, rm, writeFile, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { testPresets } from "./presets.mjs";

export async function testMcp(call) {
    const temporary = await realpath(await mkdtemp(path.join(tmpdir(), "opencode", "jsdos-mcp-test-")));
    const child = spawn(process.env.JSDOS_MCP_BINARY ?? path.resolve("mcp/target/debug/jsdos-mcp" + (process.platform === "win32" ? ".exe" : "")), [], { stdio: ["pipe", "pipe", "pipe"] });
    const pending = new Map();
    let stderr = "";
    let secret;
    let id = 0;
    let targetId;
    let previewTarget;
    child.stderr.on("data", (data) => stderr += data);
    child.on("exit", (code) => {
        for (const callback of pending.values()) callback({ error: { message: "MCP process exited", code } });
        pending.clear();
    });
    createInterface({ input: child.stdout }).on("line", (line) => {
        const response = JSON.parse(line);
        pending.get(response.id)?.(response);
        pending.delete(response.id);
    });
    function rpc(method, params = {}) {
        return new Promise((resolve, reject) => {
            const current = ++id;
            const timeout = setTimeout(() => reject(new Error("MCP timeout: " + method)), 90000);
            pending.set(current, (response) => { clearTimeout(timeout); response.error ? reject(new Error(JSON.stringify(response.error))) : resolve(response.result); });
            child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: current, method, params }) + "\n");
        });
    }
    async function tool(name, args = {}) {
        const result = await rpc("tools/call", { name, arguments: args });
        if (result.isError) throw new Error(result.content.map((content) => content.text).join("\n"));
        if (result.content[0].type === "image") return result.content[0];
        return JSON.parse(result.content[0].text);
    }
    async function wait(operation, condition) {
        const deadline = Date.now() + 30000;
        for (;;) {
            const value = await operation();
            if (condition(value)) return value;
            assert(Date.now() < deadline, "Timed out waiting for " + JSON.stringify(value).replaceAll(secret ?? "__none__", "[redacted]"));
            await new Promise((resolve) => setTimeout(resolve, 40));
        }
    }
    try {
        await rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "jsdos-test", version: "1" } });
        child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
        const tools = (await rpc("tools/list")).tools;
        assert.equal(tools.length, 8);
        assert(!tools.some((tool) => /eval|shell/i.test(tool.name)));
        const studio = await tool("studio");
        assert.equal((await tool("diagnose")).status, "not-run");
        const invalidArchive = path.join(temporary, "invalid.zip");
        await writeFile(invalidArchive, "not a zip");
        assert.equal((await tool("diagnose", { source: invalidArchive })).static.status, "invalid");
        const address = new URL(studio.url);
        secret = address.hash.slice(1);
        async function connectStudio() {
            ({ targetId } = await call("Target.createTarget", { url: "about:blank" }));
            const { sessionId } = await call("Target.attachToTarget", { targetId, flatten: true });
            await call("Network.enable", {}, sessionId);
            await call("Runtime.enable", {}, sessionId);
            await call("Network.setBlockedURLs", { urls: ["https://*"] }, sessionId);
            await call("Page.navigate", { url: studio.url }, sessionId);
            await wait(() => tool("studio"), (value) => value.connection === "connected");
            const state = await wait(() => tool("editor", { operation: "state" }), (value) => value.step === "emu-ready");
            return { sessionId, state };
        }
        let { sessionId, state } = await connectStudio();
        assert.equal((await tool("screenshot")).status, "no-frame");
        assert.equal((await tool("diagnose", { wait_ready_ms: 50 })).status, "timeout");
        const config = await readFile("test/fixtures/dosbox.conf", "utf8");
        const created = await tool("editor", { operation: "create", dosbox_conf: config, expected_revision: state.revision });
        state = created.state;
        await assert.rejects(tool("editor", { operation: "files", expected_revision: state.revision, files: [{ path: "x", contents_base64: "eA==" }] }), /not-ready/);
        const currentRevision = state.revision;
        await call("Runtime.evaluate", { expression: "new Promise(resolve=>{const check=()=>document.querySelector('textarea')?resolve():setTimeout(check,20);check()})", awaitPromise: true }, sessionId);
        await call("Runtime.evaluate", { expression: "document.querySelector('textarea').value += '\\necho UI_MCP_EDIT\\n'; document.querySelector('textarea').dispatchEvent(new Event('input',{bubbles:true}))" }, sessionId);
        state = await wait(() => tool("editor", { operation: "state" }), (value) => value.revision > currentRevision);
        await assert.rejects(tool("editor", { operation: "config", dosbox_conf: config, jsdos_version: "8.5.2", expected_revision: currentRevision }), /conflict/);
        state = await tool("editor", { operation: "start", expected_revision: state.revision });
        await wait(() => tool("diagnose"), (value) => value.stdout.includes("MCP_READY"));
        const observed = await tool("scenario", { steps: [{ type: "key", key_code: 13, pressed: true }, { type: "key", key_code: 13, pressed: false }, { type: "mouse", x: 0.5, y: 0.5 }, { type: "state" }], stdout: "MCP_READY", timeout_ms: 1000 });
        assert.equal(observed.status, "condition-observed");
        assert.equal(observed.states[0].ready, true);
        await call("Runtime.evaluate", { expression: "messages.push({type:'error',text:'[LOG_SB]INTENTIONAL_CORE_MESSAGE'})" }, sessionId);
        const coreMessages = await tool("diagnose");
        assert.equal(coreMessages.status, "observed-ready");
        assert(coreMessages.messages.some((message) => message.type === "error" && message.text === "[LOG_SB]INTENTIONAL_CORE_MESSAGE"));
        const timedOut = await tool("scenario", { steps: [], stdout: "NEVER_PRINTED_123", timeout_ms: 50 });
        assert.equal(timedOut.status, "timeout", JSON.stringify(timedOut));
        for (const tag of ["worker", "panic", "custom"]) {
            await call("Runtime.evaluate", { expression: `messages.push({type:'error',text:'[${tag}]INTENTIONAL_BACKEND_ERROR'})` }, sessionId);
            assert.equal((await tool("diagnose")).status, "error");
            assert.equal((await tool("scenario", { steps: [], stdout: "NEVER_PRINTED_123", timeout_ms: 1000 })).status, "error");
            await call("Runtime.evaluate", { expression: "messages=messages.filter(message=>!message.text.endsWith('INTENTIONAL_BACKEND_ERROR'))" }, sessionId);
        }
        await assert.rejects(tool("scenario", { steps: [{ type: "mouse", x: 2, y: 0 }], stdout: "MCP_READY", timeout_ms: 100 }), /coordinates/);
        await assert.rejects(tool("scenario", { steps: [{ type: "key", key_code: 0, pressed: true }], stdout: "MCP_READY", timeout_ms: 100 }), /keycode/);
        await assert.rejects(tool("scenario", { steps: [{ type: "eval", code: "throw new Error('not allowed')" }], stdout: "MCP_READY", timeout_ms: 100 }), /unknown variant/);
        const image = await wait(() => tool("screenshot"), (value) => value.type === "image");
        const png = Buffer.from(image.data, "base64");
        assert.equal(png.subarray(1, 4).toString(), "PNG");
        const dimensions = (await call("Runtime.evaluate", { expression: "[backend.width(),backend.height()]", returnByValue: true }, sessionId)).result.value;
        assert.equal(png.readUInt32BE(16), dimensions[0]);
        assert.equal(png.readUInt32BE(20), dimensions[1]);
        await call("Runtime.evaluate", { expression: "append('X'.repeat(70000))" }, sessionId);
        const truncated = await tool("diagnose");
        assert(truncated.truncated && truncated.stdout.length <= 65536);
        state = await tool("editor", { operation: "files", expected_revision: state.revision, files: [{ path: "RESULT.TXT", contents_base64: Buffer.from("edited via MCP").toString("base64") }] });
        assert.equal(Buffer.from((await tool("editor", { operation: "read", path: "RESULT.TXT" })).contents, "base64").toString(), "edited via MCP");
        const draft = "[autoexec]\n@echo off\necho RESTORED_DRAFT\n";
        state = await tool("editor", { operation: "config", dosbox_conf: draft, jsdos_version: "8.5.2", expected_revision: state.revision });
        const destination = path.join(temporary, "bundle.jsdos");
        const exported = await tool("editor", { operation: "export", destination, expected_revision: state.revision });
        assert.equal(exported.revision, state.revision);
        const original = await readFile(destination);
        await assert.rejects(tool("editor", { operation: "export", destination, expected_revision: state.revision }), /Destination exists/);
        assert.deepEqual(await readFile(destination), original);
        await tool("editor", { operation: "export", destination, expected_revision: state.revision, replace: true });
        await assert.rejects(tool("editor", { operation: "open", source: destination, expected_revision: state.revision }), /discardChanges/);
        state = (await tool("editor", { operation: "open", source: destination, expected_revision: state.revision, discard_changes: true })).state;
        assert(state.config.dosboxConf.includes("RESTORED_DRAFT"));
        state = await tool("editor", { operation: "start", expected_revision: state.revision });
        assert.equal(Buffer.from((await tool("editor", { operation: "read", path: "RESULT.TXT" })).contents, "base64").toString(), "edited via MCP");
        await tool("editor", { operation: "restart", expected_revision: state.revision });
        for (const preset of ["html", "vite", "react", "vue", "angular"]) {
            const generated = await tool("generate", { destination: path.join(temporary, preset), source: destination, preset });
            assert.equal(generated.buildStatus, "not-run");
            const report = await tool("verify_project", { project: generated.path, allow_build_scripts: false, timeout_seconds: 30 });
            assert.equal(report.static.status, "valid");
            assert.equal(report.build.status, "not-run");
        }
        const html = path.join(temporary, "html/index.html");
        await writeFile(html, (await readFile(html, "utf8")).replace("</head>", '<script>throw new Error("INTENTIONAL_ERROR")</script><script>Promise.reject("INTENTIONAL_REJECTION")</script><script src="./missing-resource.js"></script></head>'));
        const preview = await tool("preview_project", { operation: "start", directory: path.dirname(html) });
        assert.equal(preview.browser.status, "not-run");
        ({ targetId: previewTarget } = await call("Target.createTarget", { url: preview.url }));
        const errors = await wait(() => tool("preview_project", { operation: "report" }), (value) => ["error", "unhandledrejection", "resource-error"].every((kind) => value.browser.events.some((event) => event.type === kind)));
        assert(!JSON.stringify(errors).includes(secret));
        await call("Target.closeTarget", { targetId: previewTarget }); previewTarget = null;
        await tool("preview_project", { operation: "stop" });
        await writeFile(html, (await readFile(html, "utf8")).replace(/<script>throw new Error\("INTENTIONAL_ERROR"\)<\/script><script>Promise.reject\("INTENTIONAL_REJECTION"\)<\/script><script src="\.\/missing-resource.js"><\/script>/, ""));
        const fixed = await tool("preview_project", { operation: "start", directory: path.dirname(html) });
        ({ targetId: previewTarget } = await call("Target.createTarget", { url: fixed.url }));
        const fixedReport = await wait(() => tool("preview_project", { operation: "report" }), (value) => value.browser.events.some((event) => event.type === "jsdos-created"));
        assert(!fixedReport.browser.events.some((event) => ["error", "unhandledrejection", "resource-error", "jsdos-error"].includes(event.type)));
        await call("Target.closeTarget", { targetId: previewTarget }); previewTarget = null;
        await tool("preview_project", { operation: "stop" });
        await call("Target.closeTarget", { targetId }); targetId = null;
        await wait(() => tool("studio"), (value) => value.connection === "disconnected");
        ({ sessionId, state } = await connectStudio());
        state = (await tool("editor", { operation: "recover", expected_revision: state.revision, discard_changes: true })).state;
        await call("Runtime.evaluate", { expression: "emulators.pathPrefix=new URL('./missing-runtime/',location.href).href" }, sessionId);
        await assert.rejects(tool("editor", { operation: "start", expected_revision: state.revision }));
        const earlyFailure = await tool("diagnose");
        assert.equal(earlyFailure.status, "error");
        await call("Runtime.evaluate", { expression: "emulators.pathPrefix=new URL('./emulators/',location.href).href" }, sessionId);
        state = (await tool("editor", { operation: "recover", expected_revision: earlyFailure.state.revision, discard_changes: true })).state;
        assert.equal(state.error, null);
        await tool("editor", { operation: "start", expected_revision: state.revision });
        assert.equal(Buffer.from((await tool("editor", { operation: "read", path: "RESULT.TXT" })).contents, "base64").toString(), "edited via MCP");
        await call("Target.closeTarget", { targetId }); targetId = null;
        await wait(() => tool("studio"), (value) => value.connection === "disconnected");
        child.stdin.end();
        const code = await new Promise((resolve) => child.once("exit", resolve));
        assert.equal(code, 0);
        assert(!stderr.includes(secret), "Diagnostic output leaked the session secret");
        await assert.rejects(fetch(address.origin));
        assert.deepEqual(await readFile(destination), original);
        console.log(JSON.stringify({ suite: "mcp", status: "passed", tools: tools.length, platform: process.platform }));
        if (process.argv.includes("--presets")) await testPresets(call, temporary);
        return { temporary, bundle: destination };
    } catch (error) {
        console.error(stderr.replaceAll(secret ?? "__no_secret__", "[redacted]"));
        throw error;
    } finally {
        if (targetId) await call("Target.closeTarget", { targetId });
        if (previewTarget) await call("Target.closeTarget", { targetId: previewTarget });
        if (child.exitCode === null) child.kill();
        if (!process.env.JSDOS_KEEP_TEST_PROJECTS) await rm(temporary, { recursive: true, force: true });
    }
}
