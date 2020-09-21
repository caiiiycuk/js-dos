import { CommandInterface } from "../emulators";
import { CommandInterfaceEventsImpl } from "../impl/ci-impl";

import { JanusJS } from "./janus";

const Janus = (window as any).Janus;

export type JanusMessageType = "error" | "attached" | "started" |
    "onremotestream" | "destroyed";

class JanusBackendImpl implements CommandInterface {
    private janus: JanusJS.Janus;
    private eventsImpl: CommandInterfaceEventsImpl;

    private exitPromise: Promise<void>;
    private exitResolveFn: () => void = () => {/**/};

    private opaqueId: string;
    private handle?: JanusJS.PluginHandle;

    constructor(janus: JanusJS.Janus) {
        this.eventsImpl = new CommandInterfaceEventsImpl();
        this.janus = janus;
        this.opaqueId = "js-dos-" + Janus.randomString(12);
        this.exitPromise = new Promise<void>((resolve) => {
            this.exitResolveFn = resolve;
        });

        this.attach();
    }

    private fireMessage(type: JanusMessageType, ...args: any[]) {
        this.eventsImpl.fireMessage(type, ...args);
    }

    private attach() {
        this.janus.attach({
            plugin: "janus.plugin.streaming",
            opaqueId: this.opaqueId,
            error: this.onError,
            success: (handle) => {
                this.handle = handle;
                this.fireMessage("attached");
                this.handle.send({
                    message: {
                        request: "watch",
                        id: 1,
                    },
                });
            },
            onmessage: this.onJanusMessage,
		        onremotestream: (stream: MediaStream) => {
                this.fireMessage("onremotestream", stream);
            },
            ondata: (data: any) => {
                this.eventsImpl.fireStdout(data);
            },
        });
    }

		private onJanusMessage = (message: JanusJS.Message, jsep?: JanusJS.JSEP) => {
        if (this.handle === undefined) {
            this.fireMessage("error", new Error("Handle is undefined"));
            return;
        }

        const handle = this.handle;
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

    onError(error: any) {
        this.fireMessage("error", error);
    }

    onDestroyed() {
        this.fireMessage("destroyed");
        this.exitResolveFn();
    }

    config() {
        return Promise.reject("Not supported");
    }

    width(): number {
        throw new Error("Please use videoWidth property of binded HTMLVideoElement");
    }

    height(): number {
        throw new Error("Please use videoHeight property of binded HTMLVideoElement");
    }

    soundFrequency(): number {
        throw new Error("Not supported");
    }

    screenshot() {
        return Promise.reject(new Error("Not supported"));
    }

    simulateKeyPress(...keyCodes: number[]) {
        keyCodes.forEach(keyCode => this.sendKeyEvent(keyCode, true));
        setTimeout(() => {
            keyCodes.forEach(keyCode => this.sendKeyEvent(keyCode, false));
        }, 16);
    }

    sendKeyEvent(keyCode: number, pressed: boolean) {
        if (this.handle === undefined) {
            this.fireMessage("error", new Error("Handle is undefined"));
            return;
        }

        this.handle.data({ text: "pipe k" + (pressed ? "down" : "up") + " " + keyCode })
    }

    persist(): Promise<Uint8Array> {
        return Promise.reject("Not supported");
    }

    exit() {
        this.janus.destroy()
        return this.exitPromise;
    }

    events() {
        return this.eventsImpl;
    }
}

export default function JanusBackend(restUrl: string): Promise<CommandInterface> {
    if (typeof Janus === undefined) {
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
                backend = new JanusBackendImpl(janus);
                resolve(backend);
            },
            error: handlers.error,
            destroyed: handlers.destroyed,
            destroyOnUnload: true,
        };

        const janus = new Janus(options) as JanusJS.Janus;
    });

}
