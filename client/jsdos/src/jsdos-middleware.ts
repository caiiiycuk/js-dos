// # js-dos-middleware
// is a middle layer between dosbox server and browser client
// currently it can be sokol-direct or sokol-worker

import { DosConfig } from "./jsdos-options";
import { ICache } from "./jsdos-cache";

export interface DosMiddleware {
    onReady: (cb: () => void) => void;
    onFrame: (cb: () => void) => void;
    onShellInput: (cb: () => void) => void;
    onStdout: (cb: (message: string) => void) => void;

    sendkey: (keycode: number, pressed: boolean) => void;
    requestScreenshot: (cb: (image: ImageData) => void) => void;
    exit: () => void;
}

export type DosMiddlewareFactory = (config: DosConfig, cache: ICache) => Promise<DosMiddleware>;
