import { DosClient, DosMiddleware, WasmModule,
    JsDosConfig, DosCommandInterface, Cache, ProgressFn, WasmModuleFactory } from "../../interface/jsdos-interface";

import { DosKeys } from "./jsdos-controller";


import CacheNoop from "../../jsdos-cache/jsdos-cache-noop";
import CacheDb from "../../jsdos-cache/jsdos-cache-db";

import doLoadWasmModule from "./jsdos-wasm";
import { XhrRequest } from "./jsdos-xhr";


import Move from "./controller/move";
import Qwerty from "./controller/qwerty";
import { DosBundle } from "../../jsdos-bundle/jsdos-bundle";

import LibZip from "../../../libzip/ts/src/jsdos-libzip";

// # DosOptions
// Is a options object that you pass to constructor of
// [Dos](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos)
// class, to configure emulation layer

export interface JsDosOptionsBag {
    // ### pathPrefix
    pathPrefix?: string;
    // by default all scripts will be downloaded relative to current path,
    // you can change this by setting pathPrefix

    // ### bundle
    bundle?: Promise<DosBundle> | DosBundle | string;
    // it's a bundle that contains everyting to run dos system:
    // configuration, fs, etc. Can be an url

    // ### presistencyKey
    persistencyKey?: string;
    // if set, then file system will be stored between browser sessions

    // ### onprogress
    onprogress?: (stage: string, total: number, loaded: number) => void;
    // progress event listener, it is fired when loading progress is changed
    // if this function is not set, then
    // [auto ui](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-ui) will be used
    // to show progress
    //
    // * `stage` - current loading stage
    // * `total` - total bytes to download on current stage
    // * `loaded` - downloaded bytes

    // ### log
    log?: (...args: any[]) => void;
    // you can provide log function, to override logging, by default js-dos uses console.log as implementation

    // ### warn
    warn?: (...args: any[]) => void;
    // you can provide log function, to override logging, by default js-dos uses console.warn as implementation

    // ### err
    err?: (...args: any[]) => void;
    // you can provide log function, to override logging, by default js-dos uses console.error as implementation
}

// When you call `Dos(canvas, middleware, options)` jsdos behind the scene
// will download dosbox and prepare it to start. This function will return `Promise<DosCommandInterface>`
// that will be resolved when dosbox is ready. In case of error promise
// will be rejected.
//
// * `element`: HTMLElement | string - this element is used as window for dosbox, if you pass string then js dos will try to find element by id
// * `bundle`: Is url where to get DosBundle, or bundle itself
// * `middleware`: JsDosMiddleware - this is middle layer that communictates between jsdos api and dosbox server
// * `options`: [DosOptionBag](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) -
// optional configuration object
export type DosFactory = (element: HTMLElement | string,
                          middleware: DosMiddleware,
                          options?: JsDosOptionsBag) => Promise<DosCommandInterface>;

async function compileConfig(element: HTMLElement | string,
                             middleware: DosMiddleware,
                             options: JsDosOptionsBag): Promise<JsDosConfig> {
    let el: HTMLElement | string | null = element || "dosbox";
    if (typeof el === "string") {
        const id = el;
        el = document.getElementById(id);
        if (el == null) {
            throw new Error("Element #" + id + " not found in DOM");
        }
    }

    const log = options.log || function (...args: any) {
        // tslint:disable-next-line:no-console
        console.log.apply(null, args);
    };

    const warn = options.warn || function (...args: any) {
        // tslint:disable-next-line:no-console
        console.warn.apply(null, args);
    };

    const err = options.err || function (...args: any) {
        // tslint:disable-next-line:no-console
        console.error.apply(null, args);
    };

    let pathPrefix = options.pathPrefix || "";
    if (pathPrefix.length > 0 && pathPrefix[pathPrefix.length - 1] !== "/") {
        pathPrefix += "/";
    }

    return {
        buildInfo: middleware.buildInfo,
        element: el as HTMLElement,
        pathPrefix,
        bundleUrl: "",
        persistencyKey: options.persistencyKey || "",
        onprogress: options.onprogress || function(stage: string, total: number, loaded: number) {
            log(stage, loaded * 100 / total, "%");
        },
        log,
        warn: (...args: any) => {
            warn("WARN!", ...args);
        },
        err: (...args: any) => {
            err("ERR!", ...args);
        },
    };
}

function openCache(config: JsDosConfig): Promise<Cache> {
    return CacheDb(config.buildInfo.version)
        .catch((e) => {
            config.warn("Can't initilize cache, cause: ", e.message);
            return new CacheNoop();
        })
}

async function createLibZip(createWasmModule: WasmModuleFactory): Promise<LibZip> {
    const wasm = await createWasmModule("wlibzip.js",
                                      "WLIBZIP",
                                      () => {});
    const module = await wasm.instantiate();
    return new LibZip(module, "/home/web_user");
}


const Dos: DosFactory =
    async function (element: HTMLElement | string,
                    middleware: DosMiddleware,
                    options?: JsDosOptionsBag): Promise<DosCommandInterface> {
        options = options || {};
        const config = await compileConfig(element, middleware, options);
        const createWasmModule =
            (url: string,
             moduleName: string,
             onprogress: ProgressFn) => {
                 return doLoadWasmModule(config.pathPrefix + url,
                                       moduleName, cache, onprogress);
             };
        const createResource = XhrRequest;
        const cache = await openCache(config);
        let bundle: DosBundle | string;

        if (options.bundle === undefined) {
            bundle = new DosBundle();
        } else if (typeof options.bundle === "string") {
            bundle = options.bundle;
        } else {
            bundle = await (options.bundle as Promise<DosBundle>);
        }

        let shouldRevokeUrl = false;
        if (typeof bundle === "string") {
            config.bundleUrl = bundle;
        } else {
            if (config.persistencyKey.length > 0) {
                config.err("Persistency key can be used only with bundle url, persistnecy was disabled");
                config.persistencyKey = "";
            }
            shouldRevokeUrl = true;
            const libzip = await createLibZip(createWasmModule);
            config.bundleUrl = await bundle.toUrl(libzip, cache, createResource);
            libzip.destroy();
        }

        const jsdos: DosClient = {
            config,
            cache,
            createResource,
            createWasmModule,
        };

        const err = config.err;
        let startupErrorLog: string | undefined;
        config.err = (...args: any[]) => {
            startupErrorLog = (startupErrorLog || "") + args.join(" ") + "\n";
        };

        const ci = await middleware.run(jsdos);
        config.err = err;

        if (shouldRevokeUrl) {
            URL.revokeObjectURL(config.bundleUrl);
        }


        const exit = ci.exit;
        ci.exit = () => {
            cache.close();
            return exit.apply(ci);
        };

        if (startupErrorLog !== undefined) {
            await ci.exit();
            throw new Error(startupErrorLog);
        }

        return ci;
    };

export default Dos;

(window as any).Dos = Dos;
(window as any).DosKeys = DosKeys;
(window as any).DosController = {
    Qwerty,
    Move,
};
