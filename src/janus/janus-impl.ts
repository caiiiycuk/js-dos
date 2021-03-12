import { CommandInterface } from "../emulators";
import { CommandInterfaceEventsImpl } from "../impl/ci-impl";

import { JanusJS } from "./janus";
import { DosConfig } from "../dos/bundle/dos-conf";

export type JanusMessageType = "error" | "attached" | "started" |
    "onremotestream" | "destroyed";

function dataAssembler(onMessage: (data: string) => void,
                       onError: (message: any) => void) {
    let acc: string = "";

    const assemble = (data: string) => {
        const splitIndex = data.indexOf("\n");
        if (splitIndex == -1) {
            acc += data;
        } else {
            const payload = acc + data.substr(0, splitIndex);
            acc = "";

            try {
                onMessage(atob(payload));
            } catch (e) {
                onError(e);
            }

            assemble(data.substr(splitIndex + 1));
        }
    };

    return assemble;
}

export interface JanusCommandInterface extends CommandInterface {
    logVisual: (video: HTMLVideoElement) => void;
}

type LogColor = "white" | "red" | "yellow" | "not set";

class JanusBackendImpl implements JanusCommandInterface {
    private live = true;
    private startedAt = Date.now();

    private janus: JanusJS.Janus;
    private eventsImpl: CommandInterfaceEventsImpl;

    private exitPromise: Promise<void>;
    private exitResolveFn: () => void = () => {/**/};

    private configPromise: Promise<DosConfig>;
    private configResolveFn: (dosConfig: DosConfig) => void = () => {/**/};

    private opaqueId: string;
    private handle?: JanusJS.PluginHandle;
    private handlePromise: Promise<JanusJS.PluginHandle>;
    private handleResolveFn: (handle: JanusJS.PluginHandle) => void = () => {/**/};

    private keyMatrix: {[keyCode: number]: boolean} = {};

    private frameWidth = 0;
    private frameHeight = 0;

    private eventQueue = "";
    private eventIntervalId = -1;
    private rttIntervalId = -1;

    private logIntervalId = -1;
    private logColor: LogColor = "not set";
    private logWhiteMs = 0;
    private logRedMs = 0;
    private logYellowMs = 0;

    constructor(janus: JanusJS.Janus, opaqueId: string) {
        this.eventsImpl = new CommandInterfaceEventsImpl();
        this.janus = janus;
        this.opaqueId = opaqueId;

        this.exitPromise = new Promise<void>((resolve) => {
            this.exitResolveFn = resolve;
        });

        this.configPromise = new Promise<DosConfig>((resolve) => {
            this.configResolveFn = resolve;
        });

        this.handlePromise = new Promise<JanusJS.PluginHandle>((resolve, reject) => {
            this.handleResolveFn = (handle: JanusJS.PluginHandle) => {
                this.handle = handle;

                if (!this.live) {
                    reject(new Error("exit() was called"));
                    return;
                }

                // workaround for sending immediately after init
                setTimeout(() => {
                    if (!this.live) {
                        return;
                    }

                    handle.data({ text: "pipe " + this.opaqueId + " config" });
                }, 1000);

                this.config().then(() => {
                    if (!this.live) {
                        return;
                    }

                    // start events exchange
                    this.eventIntervalId = setInterval(() => {
                        this.sendEventsData(handle);
                    }, 8) as any;


                    // start rtt check
                    this.rttIntervalId = setInterval(() => {
                        this.sendPipeMessage("rtt", Date.now());
                    }, 1000) as any;
                });

                resolve(handle);
            }
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
        } else if (data.startsWith("frame=")) {
            const [width, height] = data.substr("frame=".length).split("x");
            this.frameWidth = Number.parseInt(width, 10) || 0;
            this.frameHeight = Number.parseInt(height, 10) || 0;
        } else if (data.startsWith("rtt=")){
            const [opaqueId, sentAtStr, receivedAtStr] = data.substr("rtt=".length).split(" ");
            const sentAt = Number.parseInt(sentAtStr, 10);
            const receivedAt = Number.parseInt(receivedAtStr, 10);
            const returnedAt = Date.now();
            const bitrateStr = this.handle?.getBitrate() as any || "0 kbits/sec";
            const bitrate = Number.parseInt(bitrateStr.split(" ")[0], 10);
            this.sendPipeMessage("rtt-data", Date.now(), sentAt, receivedAt, returnedAt, bitrate);
            if (opaqueId === this.opaqueId) {
                this.eventsImpl.fireStdout("rtt-data=" + (returnedAt - sentAt) + " " + bitrate);
            }
        } else if (data.startsWith("log-visual-")) {
            switch (data) {
                case "log-visual-white": this.eventsImpl.fireStdout("yellow-frame:" + (Date.now() - this.logYellowMs)); break;
                case "log-visual-red": this.eventsImpl.fireStdout("white-frame:" + (Date.now() - this.logWhiteMs)); break;
                case "log-visual-yellow": this.eventsImpl.fireStdout("red-frame:" + (Date.now() - this.logRedMs)); break;
            }
        } else if (data.startsWith("log-command-")) {
            switch (data) {
                case "log-command-white": this.eventsImpl.fireStdout("yellow-pipe:" + (Date.now() - this.logYellowMs)); break;
                case "log-command-red": this.eventsImpl.fireStdout("white-pipe:" + (Date.now() - this.logWhiteMs)); break;
                case "log-command-yellow": this.eventsImpl.fireStdout("red-pipe:" + (Date.now() - this.logRedMs)); break;
            }
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
        return this.configPromise;
    }

    width(): number {
        return this.frameWidth;
    }

    height(): number {
        return this.frameHeight;
    }

    soundFrequency(): number {
        return 44100;
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

    addKey(keyCode: number, pressed: boolean, timeMs: number) {
        const keyPressed = this.keyMatrix[keyCode] === true;
        if (keyPressed === pressed) {
            return;
        }
        this.keyMatrix[keyCode] = pressed;
        this.sendPipeMessage("k" + (pressed ? "down" : "up"), keyCode, timeMs);

        if (this.logIntervalId !== -1 && pressed) {
            switch (this.logColor) {
                case "white": this.logWhiteMs = Date.now(); break;
                case "red": this.logRedMs = Date.now(); break;
                case "yellow": this.logYellowMs = Date.now(); break;
            }
        }
    }

    sendMouseMotion(x: number, y: number) {
        this.sendPipeMessage("mmove", x, y, Date.now() - this.startedAt);
    }

    sendMouseButton(button: number, pressed: boolean) {
        this.sendPipeMessage("m" + (pressed ? "down" : "up"), button, Date.now() - this.startedAt);
    }

    logVisual(video: HTMLVideoElement) {
        this.sendPipeMessage("log-visual-on");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1;
        canvas.height = 1;

        this.logIntervalId = setInterval(async () => {
            const startedAt = Date.now();
            ctx?.drawImage(video, 0, 0, 1, 1, 0, 0, 1, 1);
            const imageData = ctx?.getImageData(0, 0, 1, 1)?.data as Uint8ClampedArray;
            const captureTime = Date.now() - startedAt;

            let newColor: LogColor = "not set";
            if (imageData[0] > 200 && imageData[1] > 200 && imageData[2] > 200) {
                newColor = "white";
            } else if (imageData[0] > 200 && imageData[1] < 200 && imageData[2] < 200) {
                newColor = "red";
            } else if (imageData[0] > 200 && imageData[1] > 200 && imageData[2] < 200) {
                newColor = "yellow";
            }

            if (newColor !== this.logColor) {
                switch (newColor) {
                    case "white": this.eventsImpl.fireStdout("yellow-stream:" + (Date.now() - this.logYellowMs - captureTime)); break;
                    case "red": this.eventsImpl.fireStdout("white-stream:" + (Date.now() - this.logWhiteMs - captureTime)); break;
                    case "yellow": this.eventsImpl.fireStdout("red-stream:" + (Date.now() - this.logRedMs -captureTime)); break;
                }
                this.logColor = newColor;
            }
        }, 16) as any;
    }

    private sendPipeMessage(...parts: any[]) {
        this.eventQueue += "pipe " + this.opaqueId;
        for (const part of parts) {
            this.eventQueue += " " + part;
        }
        this.eventQueue += "\n";
    }

    private async sendEventsData(handle: JanusJS.PluginHandle) {
        if (this.eventQueue.length === 0) {
            return;
        }
        handle.data({ text: this.eventQueue });
        this.eventQueue = "";
    }

    persist(): Promise<Uint8Array> {
        return Promise.reject(new Error("Not supported"));
    }

    exit() {
        this.live = false;
        clearInterval(this.logIntervalId);
        this.logIntervalId = -1;
        clearInterval(this.eventIntervalId);
        this.eventIntervalId = -1;
        clearInterval(this.rttIntervalId);
        this.rttIntervalId = -1;
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
