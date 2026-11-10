import React, { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadRuntime, playerOptions } from "./runtime.js";

function Player() {
    const container = useRef(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        let disposed = false;
        let player;
        loadRuntime().then((createDos) => {
            if (!disposed) player = createDos(container.current, playerOptions());
        }).catch((failure) => { if (!disposed) setError(failure.message); });
        return () => { disposed = true; if (player) void player.stop(); };
    }, []);
    return error ? <p role="alert">{error}</p> : <div ref={container} className="player" />;
}
createRoot(document.getElementById("app")).render(<StrictMode><Player /></StrictMode>);
