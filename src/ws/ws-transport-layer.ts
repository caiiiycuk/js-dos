import {
    TransportLayer, ClientMessage, MessageHandler,
    ServerMessage, DataChunk, FsNode,
} from "emulators/dist/types/protocol/protocol";

import { readUint32, writeUint32 } from "../player-api";
import { base91 } from "./base91";

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
    "wc-backend-event", "wc-asyncify-stats", "wc-fs-tree", "wc-fs-get-file", "wc-send-data-chunk",
    "wc-net-connected", "wc-net-received",
    "wc-sockdrive-opened", "wc-sockdrive-new-range", "wc-unload",
];
const clientMessageEnum: { [msg: string]: number } = {};
clientMessageValues.forEach((v, i) => clientMessageEnum[v] = i);

const serverMessageValues: ServerMessage[] = [
    "ws-extract-progress", "ws-ready", "ws-server-ready", "ws-frame-set-size",
    "ws-update-lines", "ws-log", "ws-warn", "ws-err",
    "ws-stdout", "ws-exit", "ws-persist", "ws-sound-init", "ws-sound-push",
    "ws-config", "ws-sync-sleep", "ws-connected", "ws-disconnected",
    "ws-asyncify-stats", "ws-fs-tree", "ws-send-data-chunk",
    "ws-net-connect", "ws-net-disconnect", "ws-net-send",
    "ws-sockdrive-open", "ws-sockdrive-ready", "ws-sockdrive-close",
    "ws-sockdrive-load-range", "ws-sockdrive-write-sector",
    "ws-unload",
];
const serverMessageEnum: { [num: string]: ServerMessage } = {};
serverMessageValues.forEach((v, i) => serverMessageEnum[i] = v);

export interface WsSocket {
    send: (data: Uint8Array) => void;
    onMessage: (handler: (data: Uint8Array) => void) => void;
    onError: (handler: (error: Error) => void) => void;
}

export class WsSocketImpl implements WsSocket {
    socket: WebSocket;
    constructor(socket: WebSocket) {
        this.socket = socket;
    }

    send(data: Uint8Array) {
        this.socket.send(data);
    }

    onMessage(handler: (data: Uint8Array) => void) {
        let version: number | null = null;
        let payloadLength: number | null = null;
        let chunkslength = 0;
        let chunks: Uint8Array[] = [];
        const onMessage = (payload: Uint8Array) => {
            if (version === null || version < 7) {
                if (version === null) {
                    if (payload.length < 6 || payload[0] !== 1 || readUint32(payload, 1) !== 1) {
                        console.error("unparsable version message on transport layer, blob size:",
                            payload.length, " error: too short");
                        return;
                    } else {
                        version = payload[5];
                    }
                }
                handler(payload);
            } else if (payloadLength === null) {
                payloadLength = readUint32(payload, 0);
                chunks.push(payload.slice(4));
                chunkslength += payload.length - 4;
            } else {
                chunks.push(payload);
                chunkslength += payload.length;
            }

            if (payloadLength !== null && chunkslength === payloadLength) {
                const combined = new Uint8Array(payloadLength);
                let offset = 0;
                for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }
                chunks = [];
                chunkslength = 0;
                payloadLength = null;
                handler(combined);
            }
        };

        const queue: {
            size: number,
            buffer: Promise<ArrayBuffer>
        }[] = [];
        let processing = false;
        this.socket.addEventListener("message", (ev) => {
            queue.push({
                size: ev.data.size,
                buffer: ev.data.arrayBuffer(),
            });

            if (!processing) {
                processing = true;
                processQueue()
                    .catch(console.error)
                    .finally(() => processing = false);
            }
        });

        const processQueue = async () => {
            while (queue.length > 0) {
                const { size, buffer } = queue.shift()!;

                try {
                    const payload = new Uint8Array(await buffer);
                    onMessage(payload);
                } catch (e: any) {
                    console.error("unparsable message on transport layer, blob size:", size, " error:", e.message);
                    console.error(e);
                }
            }
        };
    }

    onError(handler: (error: Error) => void) {
        this.socket.addEventListener("error", (e) => {
            handler(e as any);
            this.socket.close();
        });
    }
}

export class WsTransportLayer implements TransportLayer {
    socket: WsSocket;
    sessionId: string = Date.now() + "";
    hardware: Hardware;
    onInit: (version: number) => void = () => {/**/};

    private cycles = 0;
    private version = 0;

    private handler: MessageHandler = () => {/**/};

    private readUint64(container: Uint8Array, offset: number) {
        return readUint32(container, offset) + readUint32(container, offset + 4) * 2 ** 32;
    }

    private sendMessageToSocket(id: ClientMessage | number, ...payload: (Uint8Array | null)[]) {
        let length = 1;
        for (const next of payload) {
            length += 4 + (next?.length ?? 0);
        }

        const encoded = new Uint8Array(length);
        encoded[0] = typeof id === "string" ? clientMessageEnum[id] : id;
        let position = 1;
        for (const next of payload) {
            writeUint32(encoded, next?.length ?? 0, position);
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
            const length = readUint32(payload, position);
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
            case "ws-ready": {
                this.version = (payload && payload[0] && payload.length > 0) ? payload[0][0] : 0;
                this.onInit(this.version);
                this.handler(message, {});
            } break;
            case "ws-server-ready":
            case "ws-exit": {
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
                    freq: readUint32(payload[0]!, 0),
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
                    width: readUint32(payload[0]!, 0),
                    height: readUint32(payload[0]!, 4),
                });
            } break;
            case "ws-update-lines": {
                if (payload.length > 0) {
                    const lines: { start: number, heapu8: Uint8Array }[] = [];
                    for (const next of payload) {
                        lines.push({
                            start: readUint32(next!, 0),
                            heapu8: next!.slice(4),
                        });
                    }
                    this.handler(message, { lines });
                }
            } break;
            case "ws-asyncify-stats": {
                this.cycles += readUint32(payload[0]!, 0);
                const stats = {
                    messageSent: readUint32(payload[0]!, 4),
                    messageReceived: readUint32(payload[0]!, 8),
                    messageFrame: readUint32(payload[0]!, 12),
                    messageSound: readUint32(payload[0]!, 16),
                    nonSkippableSleepCount: 0,
                    sleepCount: 0,
                    sleepTime: 0,
                    cycles: this.cycles,
                    netSent: 0,
                    netRecv: 0,
                    driveBufferedAmount: 0,
                    driveIo: [],
                };
                this.handler(message, stats);
            } break;
            case "ws-connected": {
                this.handler(message, { networkType: payload[0]![0], address: textDecoder.decode(payload[1]!) });
            } break;
            case "ws-disconnected": {
                this.handler(message, { networkType: payload[0]![0] });
            } break;
            case "ws-fs-tree": {
                const info: { name: string, size: number | null }[] = [];
                for (let i = 0; i < payload.length - 1; ++i) {
                    info.push({ name: textDecoder.decode(payload[i]!), size: null });
                }

                const sizes = payload[payload.length - 1]!;
                for (let i = 0; i < info.length; ++i) {
                    const size = readUint32(sizes, i * 4);
                    info[i].size = size < 0 ? null : size;
                }

                const fsTree: FsNode = {
                    name: ".",
                    nodes: [],
                    size: null,
                };

                function lookupNode(name: string): [FsNode, string] {
                    const parts = name.split("/");
                    let node: FsNode | undefined = fsTree;
                    for (let i = 1; i < parts.length - 1; ++i) {
                        const dir = parts[i];
                        node = node!.nodes?.find((n) => n.name == dir);
                        if (!node) {
                            throw new Error("Unable to find node " + name + ", subdir " + dir);
                        }
                    }
                    return [node, parts[parts.length - 1]];
                };

                for (const { name, size } of info) {
                    const [node, basename] = lookupNode(name);
                    node.nodes?.push({
                        name: basename,
                        size,
                        nodes: size === null ? [] : null,
                    });
                }

                this.handler("ws-fs-tree", {
                    fsTree,
                });
            } break;
            case "ws-persist": {
                this.handler("ws-persist", {
                    bundle: payload.length > 0 ? payload[0]! : null,
                });
            } break;
            case "ws-net-connect": {
                let address = textDecoder.decode(payload[0]!);
                if (!address.startsWith("wss://") && !address.startsWith("ws://")) {
                    address = ((
                        window.location.protocol === "http:" &&
                        window.location.hostname !== "localhost"
                    ) ? "ws://" : "wss://") + address;
                }
                this.handler("ws-net-connect", { address });
            } break;
            case "ws-net-send": {
                this.handler("ws-net-send", {
                    networkId: readUint32(payload[0]!, 0),
                    data: payload[1],
                });
            } break;
            case "ws-net-disconnect": {
                this.handler("ws-net-disconnect", {
                    networkId: readUint32(payload[0]!, 0),
                });
            } break;
            case "ws-unload": {
                this.handler("ws-unload", {});
            } break;
            case "ws-sockdrive-open": {
                this.handler("ws-sockdrive-open", {
                    handle: readUint32(payload[0]!, 0),
                    url: textDecoder.decode(payload[1]!),
                });
            } break;
            case "ws-sockdrive-ready": {
                this.handler("ws-sockdrive-ready", {
                    handle: readUint32(payload[0]!, 0),
                });
            } break;
            case "ws-sockdrive-close": {
                this.handler("ws-sockdrive-close", {
                    handle: readUint32(payload[0]!, 0),
                });
            } break;
            case "ws-sockdrive-load-range": {
                this.handler("ws-sockdrive-load-range", {
                    handle: readUint32(payload[0]!, 0),
                    range: readUint32(payload[0]!, 4),
                });
            } break;
            case "ws-sockdrive-write-sector": {
                this.handler("ws-sockdrive-write-sector", {
                    handle: readUint32(payload[0]!, 0),
                    sector: readUint32(payload[0]!, 4),
                    data: payload[1],
                });
            } break;
            default: {
                console.warn("WARN! Unhandled server message", message);
            }
        }
    }

    constructor(socket: WsSocket, onInit: (version: number) => void) {
        this.socket = socket;
        this.socket.onError((e) => {
            this.handler("ws-err", { tag: "ws", message: e.message ?? "Unknown transport layer error" });
            this.handler("ws-exit", {});
        });
        this.socket.onMessage(this.onMessage.bind(this));
        this.sendMessageToSocket("wc-install");
        this.hardware = (null) as any;
        this.onInit = onInit;
    }

    async sendMessageToServer(name: ClientMessage, props?: { [key: string]: any; }) {
        if (props === undefined || props?.sessionId !== this.sessionId) {
            return;
        }

        const messageId = clientMessageEnum[name];
        switch (name) {
            case "wc-run": {
                const token = props.token ?? "";
                this.sendMessageToSocket(messageId, textEncoder.encode(token));
            } break;
            case "wc-send-data-chunk": {
                const chunk: DataChunk = props.chunk;
                this.sendMessageToSocket(messageId,
                    textEncoder.encode(chunk.type),
                    textEncoder.encode(chunk.name),
                    chunk.data ? new Uint8Array(chunk.data) : null);
            } break;
            case "wc-asyncify-stats": {
                this.sendMessageToSocket(messageId);
            } break;
            case "wc-add-key": {
                const payload = new Uint8Array(3 * 4);
                let offset = 0;
                offset = writeUint32(payload, props.key, offset);
                offset = writeUint32(payload, props.pressed ? 1 : 0, offset);
                writeUint32(payload, props.timeMs, offset);
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-mouse-move": {
                const payload = new Uint8Array(3 * 4 + 3);
                let offset = 0;
                offset = writeUint32(payload, Math.abs(props.x) * fMultiplier, offset);
                offset = writeUint32(payload, Math.abs(props.y) * fMultiplier, offset);
                offset = writeUint32(payload, props.timeMs, offset);
                payload[offset] = props.relative ? 1 : 0;
                payload[offset + 1] = props.x >= 0 ? 0 : 1;
                payload[offset + 2] = props.y >= 0 ? 0 : 1;
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-mouse-button": {
                const payload = new Uint8Array(4 + 2);
                payload[0] = props.button;
                payload[1] = props.pressed ? 1 : 0;
                writeUint32(payload, props.timeMs, 2);
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-mouse-sync": {
                const payload = new Uint8Array(4);
                writeUint32(payload, props.timeMs, 0);
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-connect": {
                this.sendMessageToSocket(messageId, new Uint8Array([props.networkType]),
                    textEncoder.encode(props.address));
            } break;
            case "wc-fs-tree": {
                this.sendMessageToSocket(messageId);
            } break;
            case "wc-pack-fs-to-bundle": {
                this.sendMessageToSocket(messageId, new Uint8Array([props.onlyChanges ? 1 : 0]));
            } break;
            case "wc-net-connected": {
                const id = new Uint8Array(4);
                writeUint32(id, props.networkId + 1, 0);
                this.sendMessageToSocket(messageId, id);
            } break;
            case "wc-net-received": {
                const id = new Uint8Array(4);
                writeUint32(id, props.networkId, 0);
                this.sendMessageToSocket(messageId, id, new Uint8Array(props.data));
            } break;
            case "wc-sockdrive-opened": {
                const {
                    handle, // 4
                    sectorSize, // 4
                    emptyRangesCount, // 4
                    emptyRanges, // 4 * emptyRangesCount
                    size, // 4
                    heads, // 4
                    cylinders, // 4
                    sectors, // 4
                    aheadRange, // 4
                } = props;

                const payload = new Uint8Array(4 + 4 + 4 + 4 * emptyRangesCount + 4 + 4 + 4 + 4 + 4);
                let offset = 0;
                offset = writeUint32(payload, handle, offset);
                offset = writeUint32(payload, sectorSize, offset);
                offset = writeUint32(payload, emptyRangesCount, offset);
                for (const range of emptyRanges) {
                    offset = writeUint32(payload, range, offset);
                }
                offset = writeUint32(payload, size, offset);
                offset = writeUint32(payload, heads, offset);
                offset = writeUint32(payload, cylinders, offset);
                offset = writeUint32(payload, sectors, offset);
                offset = writeUint32(payload, aheadRange, offset);
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-sockdrive-new-range": {
                const {
                    handle, // 4
                    range, // 4
                    buffer,
                } = props;
                const payload = new Uint8Array(8);
                writeUint32(payload, handle, 0);
                writeUint32(payload, range, 4);
                this.sendMessageToSocket(messageId, payload, new Uint8Array(buffer));
            } break;
            case "wc-unload": {
                this.sendMessageToSocket(messageId);
            } break;
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
        this.sendMessageToSocket("wc-exit");
    }
}

export function createWsTransportLayer(url: string, onInit: (version: number) => void): Promise<TransportLayer> {
    return new Promise<TransportLayer>((resolve) => {
        let locked = false;
        const inervalId = setInterval(() => {
            if (locked) {
                return;
            }

            locked = true;
            if (url === "android://") {
                clearInterval(inervalId);
                console.log("Connected to", url);
                resolve(new WsTransportLayer(new AndroidWsSocket(), onInit));
            } else {
                const ws = new WebSocket(url);
                const onSuccess = () => {
                    clearInterval(inervalId);
                    console.log("Connected to", url);
                    resolve(new WsTransportLayer(new WsSocketImpl(ws), onInit));
                };

                ws.addEventListener("error", (error) => {
                    console.error("Can't conect to ", url, error);
                    ws.removeEventListener("open", onSuccess);
                    ws.close();
                    locked = false;
                });

                ws.addEventListener("open", onSuccess);
            }
        }, 1000);
    });
}

class AndroidWsSocket implements WsSocket {
    private handler: (data: Uint8Array) => void = () => {/**/};
    constructor() {
        (window as any).wsMessage = (encoded: string) => {
            this.handler(base91.decode(encoded));
        };
    }
    send(data: Uint8Array) {
        (window as any).android.wcMessage(base91.encode(data));
    }
    onMessage(handler: (data: Uint8Array) => void) {
        this.handler = handler;
    }
    onError(_: (error: Error) => void) {
    }
}
