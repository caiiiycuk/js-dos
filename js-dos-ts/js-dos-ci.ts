import { DosModule } from "./js-dos-module";

interface LowLevelApi {
    send: (event: string, msg?: any, callback?: (msg: string) => void) => void;
    ping: (msg: string) => void;
}

export class DosControlInteface {
    private api: LowLevelApi;

    constructor(dos: DosModule) {
        this.api = ((dos as unknown) as LowLevelApi);
        this.api.ping = (msg: string) => {
            console.log("PING: " + msg);
        };

        (window as any).m = dos;
    }

    public exit() {
        this.api.send("exit");
    }
}
