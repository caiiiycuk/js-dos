import { DosCommandInterface } from "../../shared/jsdos-ci";

export class SokolCommandInterface implements DosCommandInterface {
    public module: any;

    constructor(module: any) {
        this.module = module;
    }

    public fullscreen() {
        throw new Error("not implemented");
    }

    public exitFullscreen() {
        throw new Error("not implemented");
    }

    public listenStdout(onstdout: (data: string) => void) {
        throw new Error("not implemented");
    }

    public shell(...cmd: string[]) {
        throw new Error("not implemented");
    }

    public screenshot() {
        return Promise.reject(new Error("not implemented"));
    }

    public exit() {
        this.module._client_exit();
    }

    public simulateKeyPress(keyCode: number) {
        throw new Error("not implemented");
    }
}
