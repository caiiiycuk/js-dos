
// # Example
// ```javascript
// Dos(canvas).ready((fs, main) => {
//     fs.extract("digger.zip").then(() => {
//         main(["-c", "DIGGER.COM"])
//     });
// });
// ```
// Dos function is entry point that provides emulation layer.
// As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).

// # Dos

import { Build } from "./jsdos-build";
import { DosCommandInterface } from "./jsdos-ci"
import { DosOptionBag, compileConfig } from "./jsdos-options";
import { DosKeys } from "./jsdos-controller";
import { DosMiddleware, DosMiddlewareFactory } from "./jsdos-middleware";

import openCache from "./jsdos-cache";

import Move from "./controller/move";
import Qwerty from "./controller/qwerty";

// When you call `Dos(canvas, options)` js-dos behind the scene will download
// dosbox and prepare it to start. This function will return `Promise<DosCommandInterface>`
// that will be resolved when dosbox is ready. In case of error promise
// will be rejected.
//
// * `element`: HTMLCanvasElement - this element is used as window for dosbox
// * `options`: [DosOptionBag](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) -
// optional configuration object
export type DosFactory = (element: HTMLElement, options?: DosOptionBag) => Promise<DosCommandInterface>;

export default function createDosFactory(middlewareFactory: DosMiddlewareFactory): DosFactory {
    return function(element: HTMLElement, options?: DosOptionBag) {
        return new Promise<DosCommandInterface>((resolve, reject) => {
            try {
                options = options || {};
                options.element = element;
                const config = compileConfig(options);
                openCache(Build.version, config, (cache) => {
                    middlewareFactory(config, cache)
                        .then((middleware: DosMiddleware) => {
                            new DosCommandInterface(config, middleware, resolve);
                        })
                        .catch(reject);
                });
            } catch (e) {
                reject(e);
            }
        });
    };
}

(window as any).DosKeys = DosKeys;
(window as any).DosController = {
    Qwerty,
    Move,
};
