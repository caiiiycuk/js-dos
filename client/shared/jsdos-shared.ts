import BuildInfo from "./jsdos-buildinfo"
import { DosOptionsBag, DosConfig } from "./jsdos-options";
import { DosCommandInterface } from "./jsdos-ci";

import { ICache } from "./jsdos-cache";

// When you call `Dos(canvas, middleware, options)` jsdos behind the scene
// will download dosbox and prepare it to start. This function will return `Promise<DosCommandInterface>`
// that will be resolved when dosbox is ready. In case of error promise
// will be rejected.
//
// * `element`: HTMLElement | string - this element is used as window for dosbox, if you pass string then js dos will try to find element by id
// * `middleware`: JsDosMiddleware - this is middle layer that communictates between jsdos api and dosbox
// * `options`: [DosOptionBag](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) -
// optional configuration object
export type DosFactory = (element: HTMLElement | string,
                          middleware: DosMiddleware,
                          options?: DosOptionsBag) => Promise<DosCommandInterface>;

export interface DosClient {
    getConfig: () => DosConfig;
    getCache: () => ICache;

    loadWasmModule: (url: string,
                     onprogress: (stage: string, total: number, loaded: number) => void) => Promise<void>;
}


export interface DosMiddleware {
    buildInfo: () => BuildInfo;
    run: (client: DosClient) => Promise<DosCommandInterface>;
};

