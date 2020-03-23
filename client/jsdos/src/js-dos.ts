
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

import { DosCommandInterface } from "./js-dos-ci"
import { DosOptionBag } from "./js-dos-options";
import { DosKeys } from "./js-dos-controller";

import Move from "./controller/move";
import Qwerty from "./controller/qwerty";

// When you call `Dos(canvas, options)` js-dos behind the scene will download
// dosbox and prepare it to start. This function will return `Promise<DosCommandInterface>`
// that will be resolved when dosbox is ready. In case of error promise
// will be rejected.
//
// * `canvas`: HTMLCanvasElement - this canvas element is used as window for dosbox
// * `options`: [DosOptions](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-options) -
// optional configuration object
export type DosFactory = (canvas: HTMLElement, options?: DosOptionBag) => Promise<DosCommandInterface>;
const Dos: DosFactory = function(canvas: HTMLElement, options?: DosOptionBag) {
    return new Promise<DosCommandInterface>((resolve, reject) => {
        reject("Not implemented");
    });
};

export default Dos;

(window as any).Dos = Dos;
(window as any).DosKeys = DosKeys;
(window as any).DosController = {
    Qwerty,
    Move,
};
