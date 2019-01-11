import { DosOptions } from "./js-dos-options";

export class DosModule extends DosOptions {
    public isValid: boolean = false;
    private instance: any;

    public debug(message: string) {
        this.log("[DEBUG] " + message);
    }

    public error(message: string) {
        this.log("[ERROR] " + message);
    }

    public info(message: string) {
        this.log("[INFO] " + message);
    }

    public ondosbox(dosbox: any, instantiateWasm: any) {
        this.info("DosBox resolved");
        (this as any).instantiateWasm = instantiateWasm;
        this.instance = new dosbox(this);
        // emscripten will call this.onRuntimeInitialized
        // when runtime will ready
    }

    public resolve() {
        if (!this.wdosboxUrl) {
            this.wdosboxUrl = "wdosbox.js";
        }

        if (!this.log) {
            /* tslint:disable:no-console */
            this.log = (message: string) => console.log(message);
        }

        if (!this.onerror) {
            this.onerror = this.error;
        }

        if (!this.onready) {
            this.onready = () => this.info("DosBox is ready");
        }

        if (!this.onprogress) {
            this.onprogress = (total, loaded) => this.info("Resolving DosBox - " + loaded * 100 / total + "%");
        }

        if (!this.canvas) {
            this.onerror("canvas field is required, but not set!");
            return;
        }

        this.isValid = true;
    }

    public onRuntimeInitialized() {
        this.onready();
    }

}
