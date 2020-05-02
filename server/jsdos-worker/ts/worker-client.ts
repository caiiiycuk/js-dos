import  { Logger } from "../../../client/interface/jsdos-interface";

type ClientMessage = "wc-run" | "wc-pack-fs-to-bundle" | "wc-add-key" | "wc-exit";
type ServerMessage = "ws-ready" | "ws-server-ready" | "ws-frame-set-size" |
    "ws-update-lines" | "ws-log" | "ws-warn" | "ws-err" | "ws-stdout" |
    "ws-exit" | "ws-persist";

export interface FrameLine {
    start: number;
    heapu8: Uint8Array;
}

export interface WorkerHost extends Logger {
    onFrameSize: (width: number, height: number) => void;
    onFrameLines: (lines: FrameLine[]) => void;
    onPersist: (bundle: Uint8Array) => void;

    onExit: () => void;
}

export class WorkerClient {

    private worker: Worker;
    private bundle?: Uint8Array;
    private host: WorkerHost;
    private ready: () => void;

    constructor(workerUrl: string,
                bundle: Uint8Array,
                host: WorkerHost,
                ready: () => void) {
        this.bundle = bundle;
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
                    bundle: this.bundle,
                });
                delete this.bundle;
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
            default: {
                console.log("Unknown worker message", name);
            } break;
        };
    }

    addKey(key: number, pressed: boolean) {
        this.sendMessage("wc-add-key", { key, pressed });
    }

    persist() {
        this.sendMessage("wc-pack-fs-to-bundle");
    }

    exit() {
        this.sendMessage("wc-exit");
    }
}
