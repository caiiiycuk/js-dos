import { Build } from "./jsdos-sokol-build";
import { DosOptionsBag, DosConfig } from "../../shared/jsdos-options";
import { DosFactory, DosMiddleware, DosClient, DosModule } from "../../shared/jsdos-shared";
import { DosCommandInterface } from "../../shared/jsdos-ci";
import { SokolCommandInterface } from "./jsdos-sokol-ci";

function onprogress(config: DosConfig) {
    return (stage: string, total: number, loaded: number) => {
        config.onprogress(stage, total, loaded);
    };
}
class DosSokolDirectImpl implements DosMiddleware {
    public defaultUrl = "wsokol.js";

    public buildInfo() {
        return Build;
    }

    public async run(jsdos: DosClient): Promise<DosCommandInterface> {
        const config = jsdos.getConfig();
        const module = await jsdos.loadWasmModule(config.jsdosUrl,
                                                  "WSOKOL",
                                                  onprogress(config));
        return new Promise<DosCommandInterface>((resolve) => {
            const Module = <DosModule> {
                canvas: jsdos.getConfig().element,
                ping: console.log,
                onRuntimeInitialized() {
                    resolve(new SokolCommandInterface(this));
                }
            };

            module.instantiate(Module);
        });
    }
}

class DosSokolWorkerImpl implements DosMiddleware {
    public defaultUrl = "wsokol.js";

    public buildInfo() {
        return Build;
    }

    public async run(jsdos: DosClient): Promise<DosCommandInterface> {
        const config = jsdos.getConfig();
        const module = await jsdos.loadWasmModule(config.jsdosUrl,
                                                  "WSOKOL",
                                                  onprogress(config));
        return new SokolCommandInterface(module);
    }
}

const DosSokol = new DosSokolDirectImpl();
export const DosSokolWorker = new DosSokolWorkerImpl();

export default DosSokol;

(window as any).DosSokol = DosSokol;
(window as any).DosSokolWorker = DosSokolWorker;
