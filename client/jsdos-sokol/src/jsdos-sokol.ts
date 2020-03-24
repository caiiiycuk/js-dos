import createDosFactory from "../../jsdos/src/jsdos";
import { DosConfig } from "../../jsdos/src/jsdos-options";
import { DosMiddleware } from "../../jsdos/src/jsdos-middleware";
import { ICache } from "../../jsdos/src/jsdos-cache";

import instanitateWasm from "../../jsdos/src/jsdos-wasm";

async function initSokolMiddleware(config: DosConfig, cache: ICache): Promise<DosMiddleware> {
    await instanitateWasm(config.wdosboxUrl, cache, config.onprogress);
    const module = (window as any).Module;
    const middleware: DosMiddleware = {
        onReady: (cb: () => void) => void {},
        onFrame: (cb: () => void) => void {},
        onShellInput: (cb: () => void) => void {},
        onStdout: (cb: (message: string) => void) => void {},

        sendkey: (keycode: number, pressed: boolean) => void {},
        requestScreenshot: (cb: (image: ImageData) => void) => void {},
        exit: () => void {},
    };
    return middleware;
}

const Dos = createDosFactory(initSokolMiddleware);

export default Dos;
(window as any).Dos = Dos;

