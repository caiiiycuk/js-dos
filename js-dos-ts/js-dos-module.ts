import { DosCommandInteface } from "./js-dos-ci";
import { DosFS } from "./js-dos-fs";
import { DosOptions } from "./js-dos-options";
import { DosUi } from "./js-dos-ui";

export class DosModule extends DosOptions {
    public isValid: boolean = false;
    private ci: Promise<DosCommandInteface> = null;
    private instance: any;
    private fs: DosFS = null;
    private ui: DosUi = null;

    public debug(message: string) {
        this.log("[DEBUG] " + message);
    }

    public info(message: string) {
        this.log("[INFO] " + message);
    }

    public warn(message: string) {
        this.log("[WARN] " + message);
    }

    public error(message: string) {
        this.log("[ERROR] " + message);
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

        if (!this.onready) {
            this.onready = (fs, main) => {
                this.info("DosBox is ready");
                main([]);
            };
        }

        if (!this.canvas) {
            this.onerror("canvas field is required, but not set!");
            return;
        }

        if (!this.onprogress) {
            this.ui = new DosUi(this);
            this.onprogress = (stage, total, loaded) => this.ui.onprogress(stage, total, loaded);
        }

        (this as any).SDL = {
            defaults: {
                widht: 320,
                height: 200,
                copyOnLock: false,
                discardOnLock: true,
                opaqueFrontBuffer: false,
            },
        };

        this.isValid = true;
    }

    public onRuntimeInitialized() {
        const mainFn = (args: string[]) => {
            if (this.ui !== null) {
                this.ui.detach();
                this.ui = null;
            }
            (this as any).callMain(args);
        };
        this.fs = new DosFS(this);
        this.onready(this.fs, mainFn);
    }

}
