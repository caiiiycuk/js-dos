import { Build } from "./jsdos-sokol-build";
import { DosOptionsBag } from "../../shared/jsdos-options";
import { DosFactory, DosMiddleware, DosClient } from "../../shared/jsdos-shared";
import { DosCommandInterface } from "../../shared/jsdos-ci";

class DosSokolDirectImpl implements DosMiddleware {
    public buildInfo() {
        return Build;
    }

    public async run(jsdos: DosClient): Promise<DosCommandInterface> {
        const config = jsdos.getConfig();
        const module = await jsdos.loadWasmModule(config.jsdosUrl,
                                                  () => { /**/ });
        throw new Error("Not implemented yet");
    }
}

class DosSokolWorkerImpl implements DosMiddleware {
    public buildInfo() {
        return Build;
    }

    public async run(jsdos: DosClient): Promise<DosCommandInterface> {
        const config = jsdos.getConfig();
        const module = await jsdos.loadWasmModule(config.jsdosUrl,
                                                  () => { /**/ });
        throw new Error("Not implemented yet");
    }
}

const DosSokol = new DosSokolDirectImpl();
export const DosSokolWorker = new DosSokolWorkerImpl();

export default DosSokol;

(window as any).DosSokol = DosSokol;
(window as any).DosSokolWorker = DosSokolWorker;
