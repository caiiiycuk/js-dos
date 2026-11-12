(() => {
    const secret = "__SESSION_SECRET__";
    const socket = new WebSocket(location.origin.replace("http:", "ws:") + "/__jsdos_events");
    let pending = [];
    function send(type, detail) {
        const event = { type, detail: String(detail).replaceAll(secret, "[redacted]").slice(0, 4096), at: Date.now() };
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
        else if (pending.length < 128) pending.push(event);
    }
    socket.onopen = () => {
        socket.send(JSON.stringify({ secret }));
        for (const event of pending) socket.send(JSON.stringify(event));
        pending = [];
    };
    window.addEventListener("error", (event) => {
        if (event.target !== window) send("resource-error", (event.target.src || event.target.href || event.target.tagName).split("#")[0]);
        else send("error", event.message);
    }, true);
    window.addEventListener("unhandledrejection", (event) => send("unhandledrejection", event.reason));
    window.addEventListener("jsdos-diagnostics-unhandled", (event) => send("unhandledrejection", event.detail));
    let createDos;
    Object.defineProperty(window, "Dos", {
        configurable: true,
        get: () => createDos,
        set(value) {
            createDos = (...args) => {
                const player = value(...args);
                let lastError;
                const watch = setInterval(() => {
                    const state = player.editor.state();
                    if (state.error && state.error !== lastError) send("jsdos-error", state.error);
                    lastError = state.error;
                }, 100);
                const stop = player.stop.bind(player);
                player.stop = () => { clearInterval(watch); return stop(); };
                send("jsdos-created", "Runtime loaded; game correctness is not proven");
                return player;
            };
        },
    });
    send("diagnostics-ready", "Observed browser events only");
})();
