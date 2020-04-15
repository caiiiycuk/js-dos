import { Build } from "./jsdos-sokol-build";
import { JsDosOptions } from "../../shared/jsdos-options";
import { DosMiddleware, DosClient } from "../../shared/jsdos-shared";
import { DosCommandInterface } from "../../shared/jsdos-ci";
import { SokolCommandInterface } from "./jsdos-sokol-ci";

function onprogress(config: JsDosOptions) {
    return (stage: string, total: number, loaded: number) => {
        config.onprogress(stage, total, loaded);
    };
}
class DosSokolDirectImpl implements DosMiddleware {
    public defaultUrl = "wsokol.js";

    public buildInfo() {
        return Build;
    }

    public run(jsdos: DosClient): Promise<DosCommandInterface> {
        return doRun(jsdos, 1 /* DIRECT */);
    }
}

class DosSokolWorkerImpl implements DosMiddleware {
    public defaultUrl = "wsokol-client.js";

    public buildInfo() {
        return Build;
    }

    public run(jsdos: DosClient): Promise<DosCommandInterface> {
        return doRun(jsdos, 2 /* WORKER_CLIENT */);
    }
}

async function doRun(jsdos: DosClient, messagingType: number): Promise<DosCommandInterface> {
    const config = jsdos.getConfig();
    const wasm = await jsdos.loadWasmModule(config.middlewareUrl,
                                              messagingType == 1 ? "WSOKOL" : "WSOKOL_CLIENT",
                                              onprogress(config));
    return new Promise<DosCommandInterface>((resolve) => {
        const module = {
            config,
            messagingType,
            canvas: jsdos.getConfig().element,
            ping: () => {/**/},
            log: config.log,
            err: config.log,
        };

        wasm.instantiate(module).then(() => {
            new SokolCommandInterface(module, resolve);
        })
    });
}

const DosSokol = new DosSokolDirectImpl();
export const DosSokolWorker = new DosSokolWorkerImpl();

export default DosSokol;

(window as any).DosSokol = DosSokol;
(window as any).DosSokolWorker = DosSokolWorker;
