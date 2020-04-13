import { DosCommandInterface } from "../../shared/jsdos-ci";

export class SokolCommandInterface implements DosCommandInterface {
    public module: any;

    constructor(module: any, ready: (ci: DosCommandInterface) => void) {
        this.module = module;
        this.module.ready = () => ready(this);
        this.module.callMain([]);
        this.module._runRuntime();
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

    public screenshot(): Promise<ImageData> {
        const width = this.module._client_frame_width();
        const height = this.module._client_frame_height();
        const rgbaPtr = this.module._client_frame_rgba();

        const rgba = new Uint8ClampedArray(this.module.HEAPU8.buffer, rgbaPtr, width * height * 4);

        for (let next = 3; next < rgba.byteLength; next = next + 4) {
            rgba[next] = 255;
        }

        return Promise.resolve(new ImageData(rgba, width, height));
    }

    public exit(): Promise<void> {
        return new Promise((resolve) => {
            this.module.exit = resolve;
            this.module._client_exit();
        });
    }

    public simulateKeyPress(keyCode: number) {
        throw new Error("not implemented");
    }

}
