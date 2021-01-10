import { CommandInterface } from "../emulators";
import { CommandInterfaceEventsImpl } from "../impl/ci-impl";

import { JanusJS } from "./janus";
import { DosConfig } from "../dos/bundle/dos-conf";

export type JanusMessageType = "error" | "attached" | "started" |
    "onremotestream" | "destroyed";

function dataAssembler(onMessage: (data: string) => void,
                       onError: (message: any) => void) {
    let acc: string = "";

    return (data: string) => {
        const splitIndex = data.indexOf("\n");
        if (splitIndex == -1) {
            acc += data;
        } else {
            const payload = acc + data.substr(0, splitIndex);
            acc = data.substr(splitIndex + 1);

            try {
                onMessage(atob(payload));
            } catch (e) {
                onError(e);
            }
        }
    };
}

class JanusBackendImpl implements CommandInterface {
    private startedAt = Date.now();

    private janus: JanusJS.Janus;
    private eventsImpl: CommandInterfaceEventsImpl;

    private exitPromise: Promise<void>;
    private exitResolveFn: () => void = () => {/**/};

    private configPromise?: Promise<DosConfig>;
    private configResolveFn: (dosConfig: DosConfig) => void = () => {/**/};

    private opaqueId: string;
    private handlePromise: Promise<JanusJS.PluginHandle>;
    private handleResolveFn: (handle: JanusJS.PluginHandle) => void = () => {/**/};

    private keyMatrix: {[keyCode: number]: boolean} = {};

    constructor(janus: JanusJS.Janus, opaqueId: string) {
        this.eventsImpl = new CommandInterfaceEventsImpl();
        this.janus = janus;
        this.opaqueId = opaqueId;
        this.exitPromise = new Promise<void>((resolve) => {
            this.exitResolveFn = resolve;
        });
        this.handlePromise = new Promise<JanusJS.PluginHandle>((resolve) => {
            this.handleResolveFn = resolve;
        });
        this.attach();
    }

    private fireMessage(type: JanusMessageType, ...args: any[]) {
        this.eventsImpl.fireMessage(type, ...args);
    }

    private attach() {
        let handleRef: JanusJS.PluginHandle;
        this.janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: this.opaqueId,
            error: this.onError,
            success: (handle) => {
                handleRef = handle;
                this.fireMessage("attached");
                handle.send({
                    message: {
                        request: "watch",
                        id: 1,
                    },
                });
            },
            onmessage: (message: JanusJS.Message, jsep?: JanusJS.JSEP) => {
                this.onJanusMessage(handleRef, message, jsep);
            },
		        onremotestream: (stream: MediaStream) => {
                this.fireMessage("onremotestream", stream);
            },
            ondataopen: () => this.handleResolveFn(handleRef),
            ondata: dataAssembler(this.onDataMessage, this.onError),
        });
    }

    private onDataMessage = (data: string) => {
        if (data.startsWith("config=")) {
            this.configResolveFn(JSON.parse(data.substr("config=".length)));
        } else {
            this.eventsImpl.fireStdout(data);
        }
    }

		private onJanusMessage = (handle: JanusJS.PluginHandle, message: JanusJS.Message, jsep?: JanusJS.JSEP) => {
        if (jsep !== undefined && jsep !== null) {
            handle.createAnswer({
                jsep,
                media: {
                    audioSend: false,
                    videoSend: false,
                    data: true,
                },
                success: (jsep: any) => {
                    this.fireMessage("started");
                    handle.send({
                        message: {
                            request: "start",
                        },
                        jsep,
                    });
                },
                error: this.onError,
            });
        }
    }

    onError = (error: any) => {
        this.fireMessage("error", error);
    }

    onDestroyed() {
        this.fireMessage("destroyed");
        this.exitResolveFn();
    }

    async config(): Promise<DosConfig> {
        if (this.configPromise !== undefined) {
            return this.configPromise;
        }
        this.configPromise = new Promise<DosConfig>((resolve) => {
            this.configResolveFn = resolve;
        });
        const handle = await this.handlePromise;
        // workaround for sending immediately after init
        setTimeout(() => {
            handle.data({ text: "pipe config" });
        }, 1000);
        return this.configPromise;
    }

    width(): number {
        throw new Error("Please use videoWidth property of binded HTMLVideoElement");
    }

    height(): number {
        throw new Error("Please use videoHeight property of binded HTMLVideoElement");
    }

    soundFrequency(): number {
        throw new Error("Not supported in this backend");
    }

    screenshot() {
        return Promise.reject(new Error("Not supported"));
    }

    simulateKeyPress(...keyCodes: number[]) {
        const timeMs = Date.now() - this.startedAt;
        keyCodes.forEach(keyCode => this.addKey(keyCode, true, timeMs));
        keyCodes.forEach(keyCode => this.addKey(keyCode, false, timeMs + 16));
    }

    sendKeyEvent(keyCode: number, pressed: boolean) {
        this.addKey(keyCode, pressed, Date.now() - this.startedAt);
    }

    async addKey(keyCode: number, pressed: boolean, timeMs: number) {
        const keyPressed = this.keyMatrix[keyCode] === true;
        if (keyPressed === pressed) {
            return;
        }
        this.keyMatrix[keyCode] = pressed;

        const handle = await this.handlePromise;
        handle.data({ text: "pipe k" + (pressed ? "down" : "up") + " " + keyCode +
            " " + timeMs});
    }

    async sendMouseMotion(x: number, y: number) {
        (await this.handlePromise)
            .data({ text: "pipe mmove " + x + " " + y + " " + (Date.now() - this.startedAt)});
    }

    async sendMouseButton(button: number, pressed: boolean) {
        (await this.handlePromise)
            .data({ text: "pipe m" + (pressed ? "down" : "up") + " " + button + " " + (Date.now() - this.startedAt)});
    }

    persist(): Promise<Uint8Array> {
        return Promise.reject(new Error("Not supported"));
    }

    exit() {
        this.janus.destroy()
        return this.exitPromise;
    }

    events() {
        return this.eventsImpl;
    }
}

export default function JanusBackend(restUrl: string, janus?: any): Promise<CommandInterface> {
    const Janus = janus || (window as any).Janus;
    if (Janus === undefined) {
        return Promise.reject(new Error("Janus is not defined, you should load janus.js before this"));
    }

    if (!Janus.isWebrtcSupported()) {
        return Promise.reject(new Error("WebRTC not supported"));
    }

    return new Promise<CommandInterface>((resolve, reject) => {
        let backend: JanusBackendImpl | null = null;
        const handlers = {
            error: (error: any) => {
                if (backend === null) {
                    reject(error);
                } else {
                    backend.onError(error);
                }
            },
            destroyed: () => {
                if (backend !== null) {
                    backend.onDestroyed();
                }
            },
        }

        const options: JanusJS.ConstructorOptions = {
            server: restUrl,
            success: () => {
                backend = new JanusBackendImpl(janusImpl, "js-dos-" + Janus.randomString(12));
                resolve(backend);
            },
            error: handlers.error,
            destroyed: handlers.destroyed,
            destroyOnUnload: true,
        };

        const janusImpl = new Janus(options) as JanusJS.Janus;
    });

}
