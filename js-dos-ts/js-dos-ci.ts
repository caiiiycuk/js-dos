import { DosModule } from "./js-dos-module";

export class DosControlInteface {
    private dos: DosModule;
    private api: any;

    constructor(dos: DosModule) {
        this.dos = dos;
        this.api = dos;
    }

    public exit() {
        this.api._jsdos_exit();
    }
}
