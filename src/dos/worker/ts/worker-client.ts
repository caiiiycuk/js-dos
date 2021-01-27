import { WasmModule } from "../../../impl/modules";
import { DosConfig } from "../../bundle/dos-conf";

type ClientMessage = "wc-install" | "wc-run" | "wc-pack-fs-to-bundle" |
    "wc-add-key" | "wc-mouse-move" | "wc-mouse-button" | "wc-exit";
type ServerMessage = "ws-ready" | "ws-server-ready" | "ws-frame-set-size" |
    "ws-update-lines" | "ws-log" | "ws-warn" | "ws-err" | "ws-stdout" |
    "ws-exit" | "ws-persist" | "ws-sound-init" | "ws-sound-push" |
    "ws-config";

export interface FrameLine {
    start: number;
    heapu8: Uint8Array;
}

export interface WorkerHost {
    onConfig: (config: DosConfig) => void;
    onFrameSize: (width: number, height: number) => void;
    onFrameLines: (lines: FrameLine[]) => void;
    onPersist: (bundle: Uint8Array) => void;
    onStdout: (message: string) => void;
    onSoundInit: (freq: number) => void;
    onSoundPush: (samples: Float32Array) => void;

    onExit: () => void;

    onLog: (...args: any[]) => void;
    onWarn: (...args: any[]) => void;
    onErr: (...args: any[]) => void;
}

export class WorkerClient {

    private worker: Worker;
    private bundles?: Uint8Array[];
    private host: WorkerHost;
    private ready: () => void;

    private keyMatrix: {[keyCode: number]: boolean} = {};

    constructor(workerUrl: string,
                wasmModule: WasmModule,
                bundles: Uint8Array[],
                host: WorkerHost,
                ready: () => void) {
        this.bundles = bundles;
        this.host = host;
        this.ready = ready;
        this.worker = new Worker(workerUrl);
        this.worker.onerror = (e) => {
            this.host.onErr(e.type, e.filename, e.message);
        };
        this.worker.onmessage = (e) => {
            const data = e.data;
            if (data === undefined) {
                return;
            }

            if (data.type === "sync_sleep_message") {
                this.worker.postMessage(data);
                return;
            }

            this.onMessage(data.name, data.props || {});
        }

        wasmModule.instantiate({});
        try {
            this.sendMessage("wc-install", { module: (wasmModule as any).wasmModule });
        } catch (e) {
            console.error("Can't send wasmModule to worker", e);
            this.sendMessage("wc-install");
        }
    }

    sendMessage(name: ClientMessage, props?: {[key: string]: any}) {
        this.worker.postMessage({
            name,
            props: props || {},
        });
    }

    onMessage(name: ServerMessage, props: {[key: string]: any}) {
        switch (name) {
            case "ws-ready": {
                this.sendMessage("wc-run", {
                    bundles: this.bundles,
                });
                delete this.bundles;
            } break;
            case "ws-server-ready": {
                this.ready();
                delete this.ready;
            } break;
            case "ws-frame-set-size": {
                this.host.onFrameSize(props.width, props.height);
            } break;
            case "ws-update-lines": {
                this.host.onFrameLines(props.lines);
            } break;
            case "ws-exit": {
                this.worker.terminate();
                this.host.onExit();
            } break;
            case "ws-log": {
                this.host.onLog.apply(this.host, props.args);
            } break;
            case "ws-warn": {
                this.host.onWarn.apply(this.host, props.args);
            } break;
            case "ws-err": {
                this.host.onErr.apply(this.host, props.args);
            } break;
            case "ws-stdout": {
                this.host.onStdout(props.message);
            } break;
            case "ws-persist": {
                this.host.onPersist(props.bundle);
            } break;
            case "ws-sound-init": {
                this.host.onSoundInit(props.freq);
            } break;
            case "ws-sound-push": {
                this.host.onSoundPush(props.samples);
            } break;
            case "ws-config": {
                this.host.onConfig(JSON.parse(props.content));
            } break;
            default: {
                // tslint:disable-next-line:no-console
                console.log("Unknown worker message", name);
            } break;
        };
    }

    addKey(keyCode: number, pressed: boolean, timeMs: number) {
        const keyPressed = this.keyMatrix[keyCode] === true;
        if (keyPressed === pressed) {
            return;
        }
        this.keyMatrix[keyCode] = pressed;
        this.sendMessage("wc-add-key", { key: keyCode, pressed, timeMs });
    }

    sendMouseMotion(x: number, y: number, timeMs: number) {
        this.sendMessage("wc-mouse-move", { x, y, timeMs })
    }

    sendMouseButton(button: number, pressed: boolean, timeMs: number) {
        this.sendMessage("wc-mouse-button", { button, pressed, timeMs });
    }

    persist() {
        this.sendMessage("wc-pack-fs-to-bundle");
    }

    exit() {
        this.sendMessage("wc-exit");
    }
}
