
import {
    TransportLayer, ClientMessage, MessageHandler,
    ServerMessage, DataChunk,
} from "emulators/dist/types/protocol/protocol";

export interface Hardware {
    readConfig(): string;
    sendMessage(payload: string): void;
    addKey(key: number, pressed: number, timeMs: number): void;
    mouseMove(x: number, y: number, relative: boolean, timeMs: number): void;
    mouseButton(button: number, pressed: number, timeMs: number): void;
    getFramePayload(): string;

    createFile(path: string): string;
    appendFile(blob: string): string;
    writeFile(path: string): string;
    closeFile(): string;
}

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();
const fMultiplier = 200000000;

// eslint-disable-next-line max-len
const clientMessageValues: ClientMessage[] = [
    "wc-install", "wc-run", "wc-pack-fs-to-bundle", "wc-add-key", "wc-mouse-move", "wc-mouse-button", "wc-mouse-sync", 
    "wc-exit", "wc-sync-sleep", "wc-pause", "wc-resume", "wc-mute", "wc-unmute", "wc-connect", "wc-disconnect", 
    "wc-backend-event", "wc-asyncify-stats", "wc-fs-tree", "wc-fs-get-file", "wc-send-data-chunk"
];
const clientMessageEnum: { [msg: string]: number } = {};
clientMessageValues.forEach((v, i) => clientMessageEnum[v] = i);

// eslint-disable-next-line max-len
const serverMessageValues: ServerMessage[] = [
    "ws-extract-progress", "ws-ready", "ws-server-ready", "ws-frame-set-size", "ws-update-lines", "ws-log", "ws-warn", "ws-err", 
    "ws-stdout", "ws-exit", "ws-persist", "ws-sound-init", "ws-sound-push", "ws-config", "ws-sync-sleep", "ws-connected", "ws-disconnected", 
    "ws-asyncify-stats", "ws-fs-tree", "ws-send-data-chunk"
];
const serverMessageEnum: { [num: string]: ServerMessage } = {};
serverMessageValues.forEach((v, i) => serverMessageEnum[i] = v);

export class WsTransportLayer implements TransportLayer {
    socket: WebSocket;
    sessionId: string = Date.now() + "";
    hardware: Hardware;


    private alive = true;
    private frameWidth = 0;
    private frameHeight = 0;
    private cycles = 0;

    private handler: MessageHandler = () => {/**/};

    private writeUint32(container: Uint8Array, value: number, offset: number) {
        container[offset] = value & 0xFF;
        container[offset + 1] = (value & 0x0000FF00) >> 8;
        container[offset + 2] = (value & 0x00FF0000) >> 16;
        container[offset + 3] = (value & 0xFF000000) >> 24;
        return offset + 4;
    }

    private readUint32(container: Uint8Array, offset: number) {
        return (container[offset] & 0x000000FF) |
            ((container[offset + 1] << 8) & 0x0000FF00) |
            ((container[offset + 2] << 16) & 0x00FF0000) |
            ((container[offset + 3] << 24) & 0xFF000000);
    }

    private readUint64(container: Uint8Array, offset: number) {
        return this.readUint32(container, offset) + this.readUint32(container, offset + 4) * 2**32;
    }

    private sendMessage(id: ClientMessage | number, ...payload: (Uint8Array | null)[]) {
        let length = 1;
        for (const next of payload) {
            length += 4 + (next?.length ?? 0);
        }

        const encoded = new Uint8Array(length);
        encoded[0] = typeof id === "string" ? clientMessageEnum[id] : id;
        let position = 1;
        for (const next of payload) {
            this.writeUint32(encoded, next?.length ?? 0, position);
            position += 4;
            if (next) {
                encoded.set(next, position);
                position += next.length;
            }
        }

        this.socket.send(encoded);
    }

    private readMessage(payload: Uint8Array): { id: number, payload: (Uint8Array | null)[] } {
        const out: Uint8Array[] = [];
        let position = 1;
        while (position + 4 <= payload.length) {
            const length = this.readUint32(payload, position);
            position += 4;

            if (position + length > payload.length) {
                throw new Error("read_message out of bounds");
            } else {
                out.push(payload.slice(position, position + length));
            }

            position += length;
        }

        return {
            id: payload[0],
            payload: out,
        };
    }

    private onMessage(msg: Uint8Array) {
        const { id, payload } = this.readMessage(msg);
        const message = serverMessageEnum[id];
        switch (message) {
            case "ws-ready":
            case "ws-server-ready":
            case "ws-exit":
                {
                    // delay ws-server-ready until ws-sound-init
                    if (message !== "ws-server-ready") {
                        this.handler(message, {});
                    }
                } break;
            case "ws-stdout":
            case "ws-log":
            case "ws-warn":
            case "ws-err": {
                this.handler(message, {
                    tag: textDecoder.decode(payload[0]!),
                    message: textDecoder.decode(payload[1]!),
                });
            } break;
            case "ws-send-data-chunk": {
                const chunk: DataChunk = {
                    type: textDecoder.decode(payload[0]!) as any,
                    name: textDecoder.decode(payload[1]!),
                    data: payload[2],
                };
                this.handler(message, { chunk });
            } break;
            case "ws-config": {
                this.handler(message, {
                    dosboxConf: payload[0]!,
                    jsdosConf: textDecoder.decode(payload[1]!),
                });
            } break;
            case "ws-sound-init": {
                this.handler(message, {
                    freq: this.readUint32(payload[0]!, 0),
                });
                this.handler("ws-server-ready", {});
            } break;
            case "ws-sound-push": {
                this.handler(message, {
                    samples: new Float32Array(payload[0]!.buffer),
                });
            } break;
            case "ws-frame-set-size": {
                this.handler(message, {
                    width: this.readUint32(payload[0]!, 0),
                    height: this.readUint32(payload[0]!, 4),
                });
            } break;
            case "ws-update-lines": {
                if (payload.length > 0) {
                    const lines: { start: number, heapu8: Uint8Array }[] = [];
                    for (const next of payload) {
                        lines.push({
                            start: this.readUint32(next!, 0),
                            heapu8: next!.slice(4),
                        });
                    }
                    this.handler(message, { lines });
                }
            } break;
            case "ws-asyncify-stats": {
                this.cycles += this.readUint32(payload[0]!, 0) * 100;
                const stats = {
                    messageSent: this.readUint32(payload[0]!, 4),
                    messageReceived: this.readUint32(payload[0]!, 8),
                    messageFrame: this.readUint32(payload[0]!, 12),
                    messageSound: this.readUint32(payload[0]!, 16),
                    nonSkippableSleepCount: 0,
                    sleepCount: 0,
                    sleepTime: 0,
                    cycles: this.cycles,
                    netSent: 0,
                    netRecv: 0,
                    driveSent: 0,
                    driveRecv: 0,
                    driveRecvTime: 0,
                    driveCacheHit: 0,
                    driveCacheMiss: 0,
                    driveCacheUsed: 0,
                };
                this.handler(message, stats);
            } break;
            default:
                console.warn("WARN! Unhandled server message", message);
        }
    }

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.addEventListener("error", (e) => {
            this.handler("ws-err", { tag: "ws", message: (e as any).message ?? "Unknown transport layer error" });
            this.handler("ws-exit", {});
            this.socket.close();
        });
        this.socket.addEventListener("message", async (ev) => {
            const blob: Blob = ev.data;
            this.onMessage(new Uint8Array(await blob.arrayBuffer()));
        });
        this.sendMessage("wc-install");
        this.hardware = (null) as any;
    }

    async sendMessageToServer(name: ClientMessage, props?: { [key: string]: any; }) {
        if (props === undefined || props?.sessionId !== this.sessionId) {
            return;
        }

        const messageId = clientMessageEnum[name];
        switch (name) {
            case "wc-run": {
                const token = props.token ?? "";
                this.sendMessage(messageId, textEncoder.encode(token));
            } break;
                // case "wc-run": {
                //     let errorMessage = writeFile(this.hardware, "bundle_0.zip", props.bundles[0]);

                //     if (errorMessage.length > 0) {
                //         console.error(errorMessage);
                //         throw new Error(errorMessage);
                //     }

                //     if (props.bundles[1] !== undefined) {
                //         errorMessage = writeFile(this.hardware, "bundle_1.zip", props.bundles[1]);
                //         if (errorMessage.length > 0) {
                //             console.error(errorMessage);
                //             throw new Error(errorMessage);
                //         }
                //     }

            //     const payload = "wc-run\n";
            //     this.hardware.sendMessage(payload);
            // } break;
            // case "wc-add-key": {
            //     this.hardware.addKey(props.key, props.pressed ? 1 : 0, props.timeMs);
            // } break;
            // case "wc-pause": {
            //     this.hardware.sendMessage("wc-pause\n" + this.sessionId + "\n");
            // } break;
            // case "wc-resume": {
            //     this.hardware.sendMessage("wc-resume\n" + this.sessionId + "\n");
            // } break;
            // case "wc-mute": {
            //     this.hardware.sendMessage("wc-mute\n" + this.sessionId + "\n");
            // } break;
            // case "wc-unmute": {
            //     this.hardware.sendMessage("wc-unmute\n" + this.sessionId + "\n");
            // } break;
            // case "wc-exit": {
            //     this.alive = false;
            //     this.hardware.sendMessage("wc-exit\n" + this.sessionId + "\n");
            // } break;
            // case "wc-mouse-move": {
            //     this.hardware.mouseMove(props.x, props.y, props.relative, props.timeMs);
            // } break;
            // case "wc-mouse-button": {
            //     this.hardware.mouseButton(props.button, props.pressed ? 1 : 0, props.timeMs);
            // } break;
            // case "wc-pack-fs-to-bundle": {
            //     this.hardware.sendMessage("wc-pack-fs-to-bundle\n" + this.sessionId + "\n");
            // } break;
            // case "wc-connect": {
            //     this.hardware.sendMessage("wc-connect\n" + this.sessionId + "\n" +
            //         props.networkType + "\n" +
            //         props.address.replace("ws://", "").replace("wss://", "") + "\n" +
            //         (props.port - 1) + "\n");
            // } break;
            // case "wc-disconnect": {
            //     this.hardware.sendMessage("wc-disconnect\n" + this.sessionId + "\n" +
            //         props.networkType + "\n");
            // } break;
            case "wc-send-data-chunk": {
                const chunk: DataChunk = props.chunk;
                this.sendMessage(messageId,
                    textEncoder.encode(chunk.type),
                    textEncoder.encode(chunk.name),
                    chunk.data ? new Uint8Array(chunk.data) : null);
            } break;
            case "wc-asyncify-stats": {
                this.sendMessage(messageId);
            } break;
            case "wc-add-key": {
                const payload = new Uint8Array(3 * 4);
                let offset = 0;
                offset = this.writeUint32(payload, props.key, offset);
                offset = this.writeUint32(payload, props.pressed ? 1 : 0, offset);
                this.writeUint32(payload, props.timeMs, offset);
                this.sendMessage(messageId, payload);
            } break;
            case "wc-mouse-move": {
                const payload = new Uint8Array(3 * 4 + 3);
                let offset = 0;
                offset = this.writeUint32(payload, Math.abs(props.x) * fMultiplier, offset);
                offset = this.writeUint32(payload, Math.abs(props.y) * fMultiplier, offset);
                offset = this.writeUint32(payload, props.timeMs, offset);
                payload[offset] = props.relative ? 1 : 0;
                payload[offset + 1] = props.x >= 0 ? 0 : 1;
                payload[offset + 2] = props.y >= 0 ? 0 : 1;
                this.sendMessage(messageId, payload);
            } break;
            case "wc-mouse-button": {
                const payload = new Uint8Array(4 + 2);
                payload[0] = props.button;
                payload[1] = props.pressed ? 1 : 0;
                this.writeUint32(payload, props.timeMs, 2);
                this.sendMessage(messageId, payload);
            } break;
            case "wc-mouse-sync": {
                const payload = new Uint8Array(4);
                this.writeUint32(payload, props.timeMs, 0);
                this.sendMessage(messageId, payload);
            }
            default: {
                console.log("Unhandled client message (wc):", name, messageId, props);
            } break;
        }
    }

    initMessageHandler(handler: MessageHandler) {
        this.handler = (message, props) => {
            props.sessionId = this.sessionId;
            handler(message, props);
        };
    }

    exit() {
        this.alive = false;
    }

    async deprecatedOnServerMessage(name: string, optProps?: { [key: string]: any }) {
        const props = optProps || {};
        switch (name) {
            case "ws-server-ready": {
                const config = this.hardware.readConfig();
                this.handler("ws-config", { sessionId: this.sessionId, content: config });
                // delay ws-server-ready until ws-sound-init
            } break;
            case "ws-sound-init": {
                this.handler(name, props);
                this.handler("ws-server-ready", { sessionId: this.sessionId });
            } break;
            case "ws-frame-set-size": {
                this.frameWidth = props.width;
                this.frameHeight = props.height;
                this.handler(name, props);
            } break;
            case "ws-sound-push": {
                this.handler(name, props);
            } break;
            case "ws-update-lines": {
                this.handler(name, props);
            } break;
            case "ws-persist": {
                props.bundle = decode(props.bundle);
                this.handler(name, props);
            } break;
            case "ws-log":
            case "ws-warn":
            case "ws-err":
            case "ws-stdout": {
                if (props.message !== undefined && props.message !== null && props.message.length > 0) {
                    props.message = textDecoder.decode(decode(props.message));
                }
                this.handler(name, props);
            } break;
            default: {
                this.handler(name as ServerMessage, props);
            }
        }
    }

    private update() {
        if (this.alive) {
            requestAnimationFrame(this.update.bind(this));
        }
        this.updateFrame();
    }

    private updateFrame() {
        if (this.frameWidth === 0 || this.frameHeight === 0) {
            return;
        }

        const framePayload = this.hardware.getFramePayload();
        if (framePayload.length === 0) {
            return;
        }

        const framePayloadU8 = decode(framePayload);
        if (framePayloadU8.length === 0) {
            return;
        }

        const lines: {
            start: number,
            heapu8: Uint8Array,
        }[] = [];

        const pitch = this.frameWidth * 3;
        let offset = this.frameHeight;
        let upBorder = -1;
        for (let line = 0; line < this.frameHeight; ++line) {
            const lastLine = line === this.frameHeight - 1;


            if (framePayloadU8[line] === 1 && upBorder === -1) {
                upBorder = line;
            } else if ((lastLine || framePayloadU8[line] === 0) && upBorder !== -1) {
                const downBorder = framePayloadU8[line] === 1 ? line : line - 1;
                const range = (downBorder - upBorder + 1) * pitch;
                const heapu8 = framePayloadU8.slice(offset, offset + range);
                lines.push({
                    start: upBorder,
                    heapu8,
                });
                offset += range;
                upBorder = -1;
            }
        }

        this.handler("ws-update-lines", {
            sessionId: this.sessionId,
            lines,
        });
    }
}

// export class HardwareTransportLayerFactory {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     private serverMessageHandler: (name: string, props?: { [key: string]: any }) => void = () => {/**/};
//
//     constructor() {
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         (window as any).serverMessage = (payload: string | { name: string }) => {
//             if (typeof payload === "string") {
//                 const json = "{" + textDecoder.decode(decode(payload)).slice(0, -1) + "}";
//                 try {
//                     const data = JSON.parse(json);
//                     this.serverMessageHandler(data.name, data);
//                 } catch (e) {
//                     console.error("Can't parse", json, e);
//                     throw e;
//                 }
//             } else {
//                 this.serverMessageHandler(payload.name, payload);
//             }
//         };
//
//         this.createTransportLayer = this.createTransportLayer.bind(this);
//     }
//
//     createTransportLayer(realtime: Hardware): TransportLayer {
//         const transport = new WsTransportLayer(realtime);
//         this.serverMessageHandler = transport.onServerMessage.bind(transport);
//         transport.callMain();
//         return transport;
//     }
// }
// export const hardwareTransportLayerFactory = new HardwareTransportLayerFactory();

export function createWsTransportLayer(url: string): Promise<TransportLayer> {
    return new Promise<TransportLayer>((resolve) => {
        let locked = false;
        const inervalId = setInterval(() => {
            if (locked) {
                return;
            }

            locked = true;
            const ws = new WebSocket(url);
            const onSuccess = () => {
                clearInterval(inervalId);
                console.log("Connected to", url);
                resolve(new WsTransportLayer(ws));
            };

            ws.addEventListener("error", (error) => {
                console.error("Can't conect to ", url, error);
                ws.removeEventListener("open", onSuccess);
                ws.close();
                locked = false;
            });

            ws.addEventListener("open", onSuccess);
        }, 1000);
    });
}

function decode(payload: string): Uint8Array {
    return new Uint8Array(0);
}
