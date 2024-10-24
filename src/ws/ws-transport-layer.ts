import {
    TransportLayer, ClientMessage, MessageHandler,
    ServerMessage, DataChunk, FsNode,
} from "emulators/dist/types/protocol/protocol";

import { createSockdrive, Template } from "./ws-sockdrive";

const sockdriveConfirmWrite = false;

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
];
const serverMessageEnum: { [num: string]: ServerMessage } = {};
serverMessageValues.forEach((v, i) => serverMessageEnum[i] = v);

export class WsTransportLayer implements TransportLayer {
    socket: WebSocket;
    sessionId: string = Date.now() + "";
    hardware: Hardware;
    onInit: (version: number) => void = () => {/**/};

    private cycles = 0;
    private sockdrive = createSockdrive(this.onSockdriveOpen.bind(this),
        this.onSockdriveError.bind(this),
        this.onSockdrivePreloadProgress.bind(this),
        this.onSockdrivePayload.bind(this));
    private sockdriveSeq = 1;
    private version = 0;

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
        return this.readUint32(container, offset) + this.readUint32(container, offset + 4) * 2 ** 32;
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
                if (payload[0]) {
                    const dosboxConf = textDecoder.decode(payload[0]);
                    this.sockdrive.applyConf(dosboxConf);
                }
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
                this.cycles += this.readUint32(payload[0]!, 0);
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
                    driveSent: this.sockdrive.stats.write,
                    driveRecv: this.sockdrive.stats.read,
                    driveCacheHit: this.sockdrive.stats.cacheHit,
                    driveCacheMiss: this.sockdrive.stats.cacheMiss,
                    driveRecvTime: this.sockdrive.stats.readTotalTime,
                    driveCacheUsed: this.sockdrive.stats.cacheUsed,
                    driveBufferedAmount: 0,
                    driveIo: this.sockdrive.stats.io,
                };
                if (payload[0]!.length > 20) {
                    stats.driveCacheHit = this.readUint32(payload[0]!, 20);
                    stats.driveCacheMiss = this.readUint32(payload[0]!, 24);
                    stats.driveRecv = this.readUint32(payload[0]!, 28);
                    stats.driveSent = this.readUint32(payload[0]!, 32);
                    stats.driveRecvTime = this.readUint32(payload[0]!, 36);
                }
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
                    const size = this.readUint32(sizes, i * 4);
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
                    networkId: this.readUint32(payload[0]!, 0),
                    data: payload[1],
                });
            } break;
            case "ws-net-disconnect": {
                this.handler("ws-net-disconnect", {
                    networkId: this.readUint32(payload[0]!, 0),
                });
            } break;
            default: {
                if (message === undefined) { // not standard messages
                    (async () => {
                        switch (id) {
                            case 100/* ws-sockdrive-open */:
                            case 104/* ws-sockdrive-open-native */: {
                                const url = textDecoder.decode(payload[0]!);
                                const owner = textDecoder.decode(payload[1]!);
                                const name = textDecoder.decode(payload[2]!);
                                const token = textDecoder.decode(payload[3]!);
                                let handle: number = this.sockdriveSeq++;
                                let aheadRange: number = 0;
                                let template: Template;
                                if (id === 100) {
                                    const tuple = await this.sockdrive.open(url, owner, name, token);
                                    handle = tuple.handle;
                                    aheadRange = tuple.aheadRange;
                                    template = this.sockdrive.template(handle);
                                } else {
                                    const response = await fetch(url.replace("wss://", "https://")
                                        .replace("ws://", "http://") + "/template/" + owner + "/" + name);
                                    const json = await response.json();
                                    if ((json as any).error) {
                                        throw new Error((json as any).error);
                                    }
                                    template = {
                                        name: json.name,
                                        size: json.size ?? 0,
                                        heads: json.heads ?? 1,
                                        cylinders: json.cylinders ?? 520,
                                        sectors: json.sectors ?? 63,
                                        sectorSize: json.sector_size ?? 512,
                                    };
                                }
                                const packet = new Uint8Array(4 * 7);
                                let offset = 0;
                                offset = this.writeUint32(packet, handle, offset);
                                offset = this.writeUint32(packet, template.size, offset);
                                offset = this.writeUint32(packet, template.heads, offset);
                                offset = this.writeUint32(packet, template.cylinders, offset);
                                offset = this.writeUint32(packet, template.sectors, offset);
                                offset = this.writeUint32(packet, template.sectorSize, offset);
                                this.writeUint32(packet, aheadRange, offset);
                                this.sendMessageToSocket(100, packet);
                            } break;
                            case 101/* ws-sockdrive-read */: {
                                const handle = this.readUint32(payload[0]!, 0);
                                const sector = this.readUint32(payload[0]!, 4);
                                const response = await this.sockdrive.read(handle, sector);
                                const packet = new Uint8Array(4);
                                this.writeUint32(packet, response.code, 0);
                                this.sendMessageToSocket(101, packet, response.buffer ?? null);
                            } break;
                            case 102/* ws-sockdrive-write */: {
                                const handle = this.readUint32(payload[0]!, 0);
                                const sector = this.readUint32(payload[0]!, 4);
                                const code = this.sockdrive.write(handle, sector, payload[1]!);
                                const packet = new Uint8Array(4);
                                this.writeUint32(packet, code, 0);
                                if (sockdriveConfirmWrite) {
                                    this.sendMessageToSocket(102, packet);
                                }
                            } break;
                            case 103/* ws-sockdrive-close */: {
                                this.sockdrive.close(this.readUint32(payload[0]!, 0));
                            } break;
                            case 105/* ws-sockdrive-native-open */: {
                                const owner = textDecoder.decode(payload[0]!);
                                const name = textDecoder.decode(payload[1]!);
                                this.onSockdriveOpen(owner + "/" + name, true,
                                    payload[2]![0] === 1, this.readUint32(payload[2]!, 1), owner, name);
                            } break;
                            default:
                                console.log("WARN! Unhandled server non standard message", id, payload);
                        }
                    })().catch((e) => {
                        this.handler("ws-err", {
                            tag: "panic",
                            message: "sockdrive error: " + (e.message ?? "???"),
                        });
                    });
                } else {
                    console.warn("WARN! Unhandled server message", message);
                }
            }
        }
    }

    constructor(socket: WebSocket, onInit: (version: number) => void) {
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
                this.sockdrive.applyToken(token);
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
                offset = this.writeUint32(payload, props.key, offset);
                offset = this.writeUint32(payload, props.pressed ? 1 : 0, offset);
                this.writeUint32(payload, props.timeMs, offset);
                this.sendMessageToSocket(messageId, payload);
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
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-mouse-button": {
                const payload = new Uint8Array(4 + 2);
                payload[0] = props.button;
                payload[1] = props.pressed ? 1 : 0;
                this.writeUint32(payload, props.timeMs, 2);
                this.sendMessageToSocket(messageId, payload);
            } break;
            case "wc-mouse-sync": {
                const payload = new Uint8Array(4);
                this.writeUint32(payload, props.timeMs, 0);
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
                this.writeUint32(id, props.networkId + 1, 0);
                this.sendMessageToSocket(messageId, id);
            } break;
            case "wc-net-received": {
                const id = new Uint8Array(4);
                this.writeUint32(id, props.networkId, 0);
                this.sendMessageToSocket(messageId, id, new Uint8Array(props.data));
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

    onSockdriveOpen(drive: string, read: boolean, write: boolean, imageSize: number,
        realOwner: string, realDrive: string) {
        this.handler("ws-log", {
            tag: "worker",
            message: "sockdrive: " + (realOwner ? realOwner + "/" + realDrive : drive) +
                ", read=" + read + ", write=" + write +
                ", imageSize=" + Math.round(imageSize / 1024 / 1024) + "Mb",
        });
    }

    onSockdriveError(e: Error) {
        this.handler("ws-err", {
            tag: "panic",
            message: e.message ?? "unable to open sockdrive",
        });
    }

    onSockdrivePreloadProgress(drive: string, restBytes: number) {
        this.handler("ws-log", {
            tag: "worker",
            message: "sockdrive: " + drive + ", preload=" + restBytes,
        });
    }

    onSockdrivePayload(owner: string, drive: string, sectorSize: number,
        aheadRange: number, sectors: number[], row: Uint8Array) {
        if (this.version > 3) {
            const sectorsPayload = new Uint8Array(sectors.length * 4 + 2 * 4);
            let offset = 0;
            for (const sector of sectors) {
                offset = this.writeUint32(sectorsPayload, sector, offset);
            }
            offset = this.writeUint32(sectorsPayload, sectorSize, offset);
            this.writeUint32(sectorsPayload, aheadRange, offset);

            this.sendMessageToSocket(106 /* wc-sockdrive-cache */,
                textEncoder.encode(owner),
                textEncoder.encode(drive),
                sectorsPayload,
                row,
            );
        }
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
            const ws = new WebSocket(url);
            const onSuccess = () => {
                clearInterval(inervalId);
                console.log("Connected to", url);
                resolve(new WsTransportLayer(ws, onInit));
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
