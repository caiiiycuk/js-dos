import { Build } from "./jsdos-sokol-build";
import { DosCommandInterface, JsDosConfig, DosMiddleware, DosClient } from "../../interface/jsdos-interface";
import { SokolCommandInterface } from "./jsdos-sokol-ci";

class DosSokolDirectImpl implements DosMiddleware {
    buildInfo = Build;
    public run(jsdos: DosClient): Promise<DosCommandInterface> {
        return doRun(jsdos, 1 /* DIRECT */);
    }
}

class DosSokolWorkerImpl implements DosMiddleware {
    buildInfo = Build;
    public run(jsdos: DosClient): Promise<DosCommandInterface> {
        return doRun(jsdos, 2 /* WORKER_CLIENT */);
    }
}

async function doRun(jsdos: DosClient,
                     messagingType: number): Promise<DosCommandInterface> {
    const config = jsdos.config;
    const wasmPromise = jsdos.createWasmModule(messagingType === 1 ? "wsokol.js" : "wsokol-client.js",
                                             messagingType === 1 ? "WSOKOL" : "WSOKOL_CLIENT",
                                             () => {});
    const bundlePromise = jsdos.createResource(config.bundleUrl, {
        cache: jsdos.cache,
        responseType: "arraybuffer",
    });

    const [wasm, bundle] = await Promise.all([wasmPromise, bundlePromise]);

    return new Promise<DosCommandInterface>((resolve) => {
        const module = {
            config,
            messagingType,
            canvas: jsdos.config,
            ping: () => {/**/},
            log: config.log,
            warn: config.warn,
            err: config.err,
        };

        wasm.instantiate(module).then(() => {
            new SokolCommandInterface(module, bundle as ArrayBuffer, resolve);
        })
    });
}

export const DosSokol = new DosSokolDirectImpl();
export const DosSokolWorker = new DosSokolWorkerImpl();


(window as any).DosSokol = DosSokol;
(window as any).DosSokolWorker = DosSokolWorker;
