import BuildInfo from "../../shared/jsdos-buildinfo";
import { DosKeys } from "./jsdos-controller";

import { DosFactory, DosClient, DosMiddleware } from "../../shared/jsdos-shared";
import { JsDosOptionsBag, JsDosOptions } from "../../shared/jsdos-options";
import { DosCommandInterface } from "../../shared/jsdos-ci";


import { ICache } from "../../shared/jsdos-cache";
import CacheDb from "./jsdos-cache-db";
import CacheNoop from "./jsdos-cache-noop";

import loadWasmModule from "./jsdos-wasm";


import Move from "./controller/move";
import Qwerty from "./controller/qwerty";

function compileConfig(options: JsDosOptionsBag, middlewareUrl: string): JsDosOptions {
    let el: HTMLElement | string | null = options.element || "dosbox";
    if (typeof el === "string") {
        const id = el;
        el = document.getElementById(id);
        if (el == null) {
            throw new Error("Element #" + id + " not found in DOM");
        }
    }
    return {
        element: el as HTMLElement,
        bundle: "",
        middlewareUrl: options.middlewareUrl || middlewareUrl,
        onprogress: options.onprogress || function(stage: string, total: number, loaded: number) {
            // tslint:disable-next-line:no-console
            console.log(stage, loaded * 100 / total, "%");
        },
        log: options.log || function(message: string) {
            // tslint:disable-next-line:no-console
            console.log(message);
        },
    };
}

function openCache(version: string, config: JsDosOptions): Promise<ICache> {
    return new Promise((resolve) => {
        new CacheDb(version, resolve, (msg: string) => {
            config.log("WARN! Can't initalize cache, cause: " + msg);
            resolve(new CacheNoop());
        });
    });
}


const Dos: DosFactory =
    async function (element: HTMLElement | string,
                    middleware: DosMiddleware,
                    options?: JsDosOptionsBag): Promise<DosCommandInterface> {
        options = options || {};
        options.element = element;
        const config = compileConfig(options, middleware.defaultUrl);
        const cache = await openCache(middleware.buildInfo().version,
                                config);
        const jsdos: DosClient = {
            getConfig: () => config,
            getCache: () => cache,
            loadWasmModule: (url: string,
                             moduleName: string,
                             onprogress: (stage: string, total: number, loaded: number) => void) => {
                                 return loadWasmModule(url, moduleName, cache, onprogress);
            }
        };

        return middleware.run(jsdos);
    };

export default Dos;

(window as any).Dos = Dos; 
(window as any).DosKeys = DosKeys;
(window as any).DosController = {
    Qwerty,
    Move,
};
