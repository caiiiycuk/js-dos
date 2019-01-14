import { Dos } from "./js-dos";
import { DosModule } from "./js-dos-module";

interface LowLevelApi {
    send: (event: string, msg?: any, callback?: (msg: string) => void) => void;
    ping: (msg: string) => void;
}

export class DosCommandInteface {
    private dos: DosModule;
    private api: LowLevelApi;
    private onready: (ci: DosCommandInteface) => void;

    constructor(dos: DosModule, onready: (ci: DosCommandInteface) => void) {
        this.dos = dos;
        this.api = ((dos as unknown) as LowLevelApi);
        this.api.ping = (msg: string) => {
            this.onping(msg);
        };
        this.onready = onready;
    }

    public width() {
        return this.dos.canvas.width;
    }

    public height() {
        return this.dos.canvas.height;
    }

    public screenshot() {
        return new Promise((resolve) => {
            this.api.send("screenshot", "", (data) => {
                resolve(data);
            });
        });
    }

    public exit() {
        try {
            this.api.send("exit");
        } catch (e) {
            return 0;
        }

        this.dos.error("Runtime is still alive!");
        return -1;
    }

    private onping(msg: string) {
        switch (msg) {
            case "ready":
                this.onready(this);
                break;
            default:
                // do nothing
        }
    }
}
