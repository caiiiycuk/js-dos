import { Emulators } from "emulators";
import {
    TransportLayer, ClientMessage, MessageHandler,
} from "emulators/dist/types/protocol/protocol";
import { BinaryTransport } from "emulators/dist/types/protocol/binary-transport";

import { readUint32 } from "../player-api";
import { base91 } from "./base91";

declare const emulators: Emulators;

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
    sessionId: string = Date.now() + "";
    socket: WsSocket;
    onInit: (version: number) => void = () => {/**/};
    binaryTransport: BinaryTransport;

    constructor(socket: WsSocket, onInit: (version: number) => void) {
        this.socket = socket;
        this.binaryTransport = emulators.binaryTransport(this.sessionId,
            this.socket.send.bind(this.socket), onInit);
        this.socket.onError((e) => {
            this.binaryTransport.handler("ws-err", {
                tag: "ws", message: e.message ?? "Unknown transport layer error",
            });
            this.binaryTransport.handler("ws-exit", {});
        });
        this.socket.onMessage(this.binaryTransport.onMessage.bind(this.binaryTransport));
        this.binaryTransport.sendWcInstall();
        this.onInit = onInit;
    }

    sendMessageToServer(name: ClientMessage, props?: { [key: string]: any; }) {
        return this.binaryTransport.sendMessageToServer(name, props);
    }

    initMessageHandler(handler: MessageHandler) {
        this.binaryTransport.initMessageHandler(handler);
    }

    exit() {
        this.binaryTransport.sendWcExit();
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
