
import { DosCommandInteface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";

// Dos
// ===
// Dos function is entry point that provides emulation layer.
// As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).
//
// **canvas** - is **required**, you should set existing HTMLCanvasElement, it will be used for render dos screen
// **options** - See [DosOptions](js-dos-options.html) to understand how you can configure Dos class.
export function Dos(canvas: HTMLCanvasElement, options: DosOptions) {
    const promise = new Promise<DosRuntime>((resolve, reject) => {
        const module = new DosModule(canvas, resolve);
        Object.assign(module, options);

        // Errors
        // ------
        // Error propagation should support both ways:
        // 1. Through reject of promise
        // 2. Fire onerror function of DosOptions object
        const onerror = module.onerror;
        module.onerror = (message: string) => {
            reject(message);

            const fn = () => {
                if (onerror) {
                    onerror(message);
                    module.onerror = onerror;
                } else {
                    module.onerror = module.error;
                }
            };

            setTimeout(fn, 1);
        };

        module.resolve();
        if (!module.isValid) {
            return;
        }

        // See [Host](js-dos-host.html) to understand resolving of emulation layer (dosbox).
        Host.resolveDosBox(module.wdosboxUrl, module);
    });

    const dosReadyPromise = (promise as unknown) as DosReadyPromise;
    dosReadyPromise.ready = (onready) => {
        dosReadyPromise.then((runtime: DosRuntime) => {
            onready(runtime.fs, runtime.main);
        });
    };
    return dosReadyPromise;
}

// DosReadyPromise
// ---------------
// Is Promise object with additional method ready. It returned by  Dos function
// when promise is resolved it means that DosBox runtime is ready for use
// and you can start your program

// DosRuntime
// ----------
export type DosMainFn = (args: string[]) => Promise<DosCommandInteface>;

export interface DosRuntime {
    fs: DosFS;
    main: DosMainFn;
}

export interface DosReadyPromise extends Promise<DosRuntime> {
    // ready
    // -------
    // This function is called before running entry point of dosbox
    // with it you can change command line arguments that passed to dosbox
    // or configure FS layer
    ready: (onready: (fs: DosFS, main: DosMainFn) => void) => void;
}

(window as any).Dos = Dos;
