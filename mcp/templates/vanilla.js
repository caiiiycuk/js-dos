import { loadRuntime, playerOptions } from "./runtime.js";
loadRuntime().then((createDos) => {
    const player = createDos(document.getElementById("app"), playerOptions());
    window.addEventListener("pagehide", () => { void player.stop(); }, { once: true });
}).catch((error) => {
    document.getElementById("app").textContent = error.message;
});
