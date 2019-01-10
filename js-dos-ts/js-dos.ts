
import { JsDosOptions } from "./js-dos-options";
import { JsDosModule } from "./js-dos-module";
import { resolveDosBox } from "./js-dos-dosbox";

export class JsDos {
    public module: JsDosModule;

    constructor(options: JsDosOptions) {
        this.module = new JsDosModule();
        Object.assign(this.module, options);
        this.module.resolve();

        if (!this.module.isValid) {
            return;
        }

        resolveDosBox(this.module.wdosbox, this.module);
    }
}