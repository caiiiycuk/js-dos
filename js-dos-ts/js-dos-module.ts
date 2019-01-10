import { JsDosOptions } from "./js-dos-options";

export class JsDosModule extends JsDosOptions {
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

    public ondosbox(dosbox: any) {
        this.info("DosBox resolved");
        this.instance = new dosbox(this);
        // TODO: wait for module ready!
        this.onready();
    }

    public resolve() {
        if (!this.wdosbox) {
            this.wdosbox = "wdosbox.js";
        }

        if (!this.log) {
            /* tslint:disable:no-console */
            this.log = (message: string) => console.log(message);
        }

        if (!this.onerror) {
            this.onerror = this.error;
        }

        if (!this.onready) {
            this.onready = () => this.info("Dosbox is ready");
        }

        if (!this.canvas) {
            this.onerror("canvas field is required, but not set!");
            return;
        }

        this.isValid = true;
    }

}
