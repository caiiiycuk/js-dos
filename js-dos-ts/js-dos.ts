
import { Host } from "./js-dos-host";
import { DosModule } from "./js-dos-module";
import { DosOptions } from "./js-dos-options";

export class Dos {
    public module: DosModule;

    constructor(options: DosOptions) {
        this.module = new DosModule();
        Object.assign(this.module, options);
        this.module.resolve();

        if (!this.module.isValid) {
            return;
        }

        Host.resolveDosBox(this.module.wdosboxUrl, this.module);
    }
}
