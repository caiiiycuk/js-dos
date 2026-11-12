let loading;
export function loadRuntime() {
    if (window.Dos) return Promise.resolve(window.Dos);
    loading ??= new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = new URL("runtime/js-dos.js", document.baseURI).href;
        script.onload = () => resolve(window.Dos);
        script.onerror = () => reject(new Error("Cannot load local js-dos runtime; use an HTTP server, not file://"));
        document.head.append(script);
    });
    return loading;
}
export function playerOptions() {
    return { url: new URL("bundle.jsdos", document.baseURI).href,
        pathPrefix: new URL("runtime/emulators/", document.baseURI).href,
        autoStart: true, workerThread: true, offscreenCanvas: false };
}
