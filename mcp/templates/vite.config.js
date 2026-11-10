export default ({ mode }) => ({
    define: { __VUE_OPTIONS_API__: true, __VUE_PROD_DEVTOOLS__: false, __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false },
    server: { hmr: mode !== "diagnostic" },
    plugins: mode === "diagnostic" ? [{
        name: "jsdos-opt-in-diagnostics",
        transformIndexHtml: {
            order: "pre",
            handler() { return [{ tag: "script", attrs: { src: "/__jsdos_diagnostics.js" }, injectTo: "head-prepend" }]; },
        },
    }] : [],
});
