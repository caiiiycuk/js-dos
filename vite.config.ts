import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    server: {
        port: 3000,
        host: "0.0.0.0",
        cors: true,
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "js-dos.js",
                assetFileNames: (info) => {
                    return info.name === "index.css" ? "js-dos.css" : info.name;
                },
            },
        },
    },
    define: {
        JSDOS_VERSION: JSON.stringify(process.env.npm_package_version),
    },
});
