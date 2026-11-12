const secret = location.hash.slice(1);
history.replaceState(null, "", location.pathname);
let backend = null;
let observedFrame = false;
let stdout = "";
let messages = [];
let truncated = false;
function append(text) {
    stdout += text;
    if (stdout.length > 65536) { stdout = stdout.slice(-65536); truncated = true; }
}
window.player = Dos(document.getElementById("app"), {
    pathPrefix: new URL("./emulators/", location.href).href,
    runInBackground: true,
    autoStart: false,
    workerThread: true,
    offscreenCanvas: false,
    backend: "dosbox",
    onEvent(event, ci) {
        if (event !== "ci-ready") return;
        backend = ci;
        observedFrame = false;
        stdout = "";
        messages = [];
        truncated = false;
        ci.events().onStdout((text) => { if (backend === ci) append(text); });
        ci.events().onFrame(() => { if (backend === ci) observedFrame = true; });
        ci.events().onMessage((type, ...args) => {
            if (backend !== ci) return;
            messages.push({ type, text: args.join(" ").slice(0, 4096) });
            if (messages.length > 128) { messages.shift(); truncated = true; }
        });
        ci.events().onExit(() => { if (backend === ci) backend = null; });
    },
});

function encode(bytes) {
    if (bytes.length > 64 * 1024 * 1024) throw new Error("Transfer exceeds 64 MiB limit");
    let result = "";
    for (let index = 0; index < bytes.length; index += 32768) {
        result += String.fromCharCode(...bytes.subarray(index, index + 32768));
    }
    return btoa(result);
}
function decode(text) { return Uint8Array.from(atob(text), (character) => character.charCodeAt(0)); }
function hasBackendError() {
    // SAFETY: DOSBox LOG_* messages use the error channel without implying a failed browser backend.
    return player.editor.state().error || messages.some((message) => message.type === "error" && !/^\[LOG_[A-Z0-9_]+\]/.test(message.text));
}
function diagnostics() {
    return { state: player.editor.state(), program: backend?.getRunningProgram() ?? null,
        stdout, messages, truncated, audio: "Browser autoplay and background throttling policies still apply",
        status: hasBackendError() ? "error" : player.editor.state().ready ? "observed-ready" : "not-run" };
}
async function operation(name, args, deadline) {
    const options = { expectedRevision: args.expectedRevision };
    switch (name) {
        case "state": return player.editor.state();
        case "open": return player.editor.open(decode(args.bundle), { ...options, discardChanges: args.discardChanges });
        case "config": return player.editor.setConfig(args.config, options);
        case "tree": return player.editor.tree();
        case "read": return { contents: encode(await player.editor.readFile(args.path)) };
        case "write": return player.editor.files(args.files.map((file) => file.delete ? { path: file.path, delete: true } :
            { path: file.path, contents: decode(file.contents) }), options);
        case "start": return player.editor.start(options);
        case "restart": return player.editor.restart(options);
        case "snapshot": {
            const snapshot = await player.editor.snapshot(options);
            return { ...snapshot, bundle: encode(snapshot.bundle) };
        }
        case "diagnostics": {
            const until = Math.min(deadline, Date.now() + (args.waitReadyMs ?? 0));
            while (args.waitReadyMs && diagnostics().status === "not-run") {
                if (Date.now() >= until) return { ...diagnostics(), status: "timeout" };
                await new Promise((resolve) => setTimeout(resolve, 20));
            }
            return diagnostics();
        }
        case "screenshot": {
            if (!backend || !observedFrame) return { status: "no-frame" };
            const image = await backend.screenshot();
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.getContext("2d").putImageData(image, 0, 0);
            return { status: "image", width: image.width, height: image.height,
                data: canvas.toDataURL("image/png").split(",")[1] };
        }
        case "scenario": {
            if (!backend) throw new Error("CI is not ready");
            const ci = backend;
            const states = [];
            if (!Array.isArray(args.steps) || args.steps.length > 128) throw new Error("At most 128 steps are allowed");
            const keys = new Set([8, 9, 13, 16, 17, 18, 19, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46,
                ...Array.from({ length: 10 }, (_, index) => 48 + index), ...Array.from({ length: 26 }, (_, index) => 65 + index),
                ...Array.from({ length: 12 }, (_, index) => 112 + index)]);
            for (const step of args.steps) {
                if (step.type === "key" && (!keys.has(step.keyCode) || typeof step.pressed !== "boolean")) throw new Error("Invalid keycode");
                else if (step.type === "mouse" && (![step.x, step.y].every((value) => Number.isFinite(value) && value >= 0 && value <= 1))) throw new Error("Coordinates must be normalized");
                else if (step.type === "button" && (![0, 1, 2].includes(step.button) || typeof step.pressed !== "boolean")) throw new Error("Invalid mouse button");
                else if (step.type === "wait" && (!Number.isInteger(step.ms) || step.ms < 0 || step.ms > 10000)) throw new Error("Invalid wait");
                else if (!["key", "mouse", "button", "wait", "state"].includes(step.type)) throw new Error("Unknown scenario step");
            }
            if (!args.stdout || args.stdout.length > 1024 || args.timeoutMs < 1 || args.timeoutMs > 30000) throw new Error("A bounded stdout condition is required");
            const until = Math.min(deadline, Date.now() + args.timeoutMs);
            const heldKeys = new Set();
            const heldButtons = new Set();
            try {
                for (const step of args.steps) {
                    if (backend !== ci) return { ...diagnostics(), status: "interrupted" };
                    if (Date.now() >= until) return { ...diagnostics(), status: "timeout" };
                    if (step.type === "key") { ci.sendKeyEvent(step.keyCode, step.pressed); step.pressed ? heldKeys.add(step.keyCode) : heldKeys.delete(step.keyCode); }
                    else if (step.type === "mouse") ci.sendMouseMotion(step.x, step.y);
                    else if (step.type === "button") { ci.sendMouseButton(step.button, step.pressed); step.pressed ? heldButtons.add(step.button) : heldButtons.delete(step.button); }
                    else if (step.type === "wait") await new Promise((resolve) => setTimeout(resolve, Math.min(step.ms, until - Date.now())));
                    else if (step.type === "state") {
                        const state = player.editor.state();
                        states.push({ revision: state.revision, ready: state.ready, paused: state.paused, hidden: state.hidden, audio: state.audio });
                    }
                }
                if (Date.now() >= until) return { ...diagnostics(), status: "timeout" };
                while (!stdout.includes(args.stdout)) {
                    if (backend !== ci) return { ...diagnostics(), status: "interrupted" };
                    if (Date.now() >= until) return { ...diagnostics(), status: "timeout" };
                    if (hasBackendError()) return { ...diagnostics(), status: "error" };
                    await new Promise((resolve) => setTimeout(resolve, 20));
                }
                return { ...diagnostics(), states, status: "condition-observed" };
            } finally {
                for (const key of heldKeys) ci.sendKeyEvent(key, false);
                for (const button of heldButtons) ci.sendMouseButton(button, false);
            }
        }
        default: throw new Error("Unsupported operation");
    }
}
function connect() {
    if (!secret) return;
    const socket = new WebSocket(location.origin.replace("http:", "ws:") + "/bridge");
    let session;
    let connection;
    socket.onopen = () => socket.send(JSON.stringify({ secret }));
    socket.onmessage = async (event) => {
        const request = JSON.parse(event.data);
        if (!session) { session = request.session; connection = request.connection; return; }
        if (request.session !== session || request.connection !== connection) return;
        const response = { session, connection, id: request.id };
        try {
            if (Date.now() > request.deadline) throw new Error("Command deadline expired");
            response.result = await operation(request.operation, request.arguments, request.deadline);
        } catch (error) {
            response.error = { code: error.code ?? "backend", message: error.message.replaceAll(secret, "[redacted]"),
                revision: error.revision, completed: error.completed };
        }
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(response));
    };
    socket.onclose = () => setTimeout(connect, 1000);
}
connect();
