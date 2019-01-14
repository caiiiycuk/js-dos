
import { DosCommandInteface } from "./js-dos-ci";
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";

// Dos
// ===
// Dos is function is entry point that provides emulation layer.
// As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).
//
// See [DosOptions](js-dos-options.html) to understand how you can configure Dos class.
export function Dos(options: DosOptions) {
    return new Promise<DosCommandInteface>((resolve, reject) => {
        const module = new DosModule();
        Object.assign(module, options);

        // Errors
        // ------
        // Error propagation should support both ways:
        // 1. Through reject of promise
        // 2. Listner style of DosOptions object
        const onerror = module.onerror;
        module.onerror = (message: string) => {
            reject(message);

            // leaving promise scope
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

        new DosCommandInteface(module, (ci: DosCommandInteface) => {
            resolve(ci);
        });

        // See [Host](js-dos-host.html) to understand resolving of emulation layer (dosbox).
        Host.resolveDosBox(module.wdosboxUrl, module);
    });
}
