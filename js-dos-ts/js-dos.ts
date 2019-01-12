
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";

// Dos
// ---
// Dos is main class that provides emulation layer.
// As emulation layer js-dos uses [DosBox ported to emscripten](https://github.com/dreamlayers/em-dosbox/#compiling).
//
// See [DosOptions](js-dos-options.html) to understand how you can configure Dos class.
export class Dos {
    // Here we are holding instance of emscripten module.
    public module: DosModule;

    constructor(options: DosOptions) {
        this.module = new DosModule();
        Object.assign(this.module, options);
        this.module.resolve();

        if (!this.module.isValid) {
            return;
        }

        // See [Host](js-dos-host.html) to understand resolving of emulation layer (dosbox).
        Host.resolveDosBox(this.module.wdosboxUrl, this.module);
    }
}
