import { DosCommandInterface } from "../../interface/jsdos-interface";

export class SokolCommandInterface implements DosCommandInterface {
    public module: any;

    constructor(module: any,
                bundle: ArrayBuffer,
                ready: (ci: DosCommandInterface) => void) {
        this.module = module;
        this.module.bundle = new Uint8Array(bundle);
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
        return this.persist()
            .catch(this.module.err)
            .then(() => new Promise((resolve) => {
                this.module.bundleCache.close();
                this.module.exit = resolve;
                this.module._client_exit();
            }));
    }

    public simulateKeyPress(keyCode: number) {
        return Promise.reject(new Error("Not implemented"));
    }

    public persist(): Promise<void> {
        if (!this.module.persistency) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this.module.persist = (archive: Uint8Array) => {
                this.module.bundleCache.put(this.module.config.bundleUrl, archive)
                    .then(resolve).catch(reject);
                delete this.module.persist;
            }

            try {
                this.module._packFsToBundle();
            } catch (e) {
                reject(e);
            }
        });
    }

}
