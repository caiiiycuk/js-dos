/* eslint-disable no-lone-blocks */

import { TransportLayer, ClientMessage, MessageHandler, ServerMessage } from "emulators/dist/types/protocol/protocol";
import * as base64 from "base64-js";

export interface Hardware {
    readConfig(): string;
    sendMessage(payload: string): void;
    addKey(key: number, pressed: number, timeMs: number): void;
    mouseMove(x: number, y: number, relative: boolean, timeMs: number): void;
    mouseButton(button: number, pressed: number, timeMs: number): void;
    getFramePayload(): string;

    createFile(path: string): string;
    appendFile(blob: string): string;
    closeFile(): string;
}

const textDecoder = new TextDecoder();

class HardwareTransportLayer implements TransportLayer {
    sessionId: string = Date.now() + "";
    hardware: Hardware;


    private alive = true;
    private frameWidth = 0;
    private frameHeight = 0;

    private handler: MessageHandler = () => {/**/};

    constructor(realtime: Hardware) {
        this.hardware = realtime;
    }

    callMain() {
        this.hardware.sendMessage("wc-install\n" + this.sessionId + "\n");
        requestAnimationFrame(this.update.bind(this));
    }

    // eslint-disable-next-line
    async sendMessageToServer(name: ClientMessage, props?: { [key: string]: any; }) {
        if (props === undefined || props?.sessionId !== this.sessionId) {
            return;
        }

        switch (name) {
            case "wc-run": {
                let errorMessage = writeFile(this.hardware, "bundle_0.zip", props.bundles[0]);

                if (errorMessage.length > 0) {
                    console.error(errorMessage);
                    throw new Error(errorMessage);
                }

                if (props.bundles[1] !== undefined) {
                    errorMessage = writeFile(this.hardware, "bundle_1.zip", props.bundles[1]);
                    if (errorMessage.length > 0) {
                        console.error(errorMessage);
                        throw new Error(errorMessage);
                    }
                }

                const payload = "wc-run\n";
                this.hardware.sendMessage(payload);
            } break;
            case "wc-add-key": {
                this.hardware.addKey(props.key, props.pressed ? 1 : 0, props.timeMs);
            } break;
            case "wc-pause": {
                this.hardware.sendMessage("wc-pause\n" + this.sessionId + "\n");
            } break;
            case "wc-resume": {
                this.hardware.sendMessage("wc-resume\n" + this.sessionId + "\n");
            } break;
            case "wc-mute": {
                this.hardware.sendMessage("wc-mute\n" + this.sessionId + "\n");
            } break;
            case "wc-unmute": {
                this.hardware.sendMessage("wc-unmute\n" + this.sessionId + "\n");
            } break;
            case "wc-exit": {
                this.alive = false;
                this.hardware.sendMessage("wc-exit\n" + this.sessionId + "\n");
            } break;
            case "wc-mouse-move": {
                this.hardware.mouseMove(props.x, props.y, props.relative, props.timeMs);
            } break;
            case "wc-mouse-button": {
                this.hardware.mouseButton(props.button, props.pressed ? 1 : 0, props.timeMs);
            } break;
            case "wc-pack-fs-to-bundle": {
                this.hardware.sendMessage("wc-pack-fs-to-bundle\n" + this.sessionId + "\n");
            } break;
            case "wc-connect": {
                this.hardware.sendMessage("wc-connect\n" + this.sessionId + "\n" +
                    props.networkType + "\n" +
                    props.address.replace("ws://", "").replace("wss://", "") + "\n" +
                    (props.port - 1) + "\n");
            } break;
            case "wc-disconnect": {
                this.hardware.sendMessage("wc-disconnect\n" + this.sessionId + "\n" +
                    props.networkType + "\n");
            } break;
            default: {
                console.log("Unhandled client message (wc):", name, props);
            } break;
        }
    }

    initMessageHandler(handler: MessageHandler) {
        this.handler = handler;
    }

    exit() {
        this.alive = false;
    }

    // eslint-disable-next-line
    async onServerMessage(name: string, optProps?: { [key: string]: any }) {
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

export class HardwareTransportLayerFactory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private serverMessageHandler: (name: string, props?: { [key: string]: any }) => void = () => {/**/};

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).serverMessage = (payload: string | { name: string }) => {
            if (typeof payload === "string") {
                const json = "{" + textDecoder.decode(decode(payload)).slice(0, -1) + "}";
                try {
                    const data = JSON.parse(json);
                    this.serverMessageHandler(data.name, data);
                } catch (e) {
                    console.error("Can't parse", json, e);
                    throw e;
                }
            } else {
                this.serverMessageHandler(payload.name, payload);
            }
        };

        this.createTransportLayer = this.createTransportLayer.bind(this);
    }

    createTransportLayer(realtime: Hardware): TransportLayer {
        const transport = new HardwareTransportLayer(realtime);
        this.serverMessageHandler = transport.onServerMessage.bind(transport);
        transport.callMain();
        return transport;
    }
}

export const hardwareTransportLayerFactory = new HardwareTransportLayerFactory();

function writeFile(hardware: Hardware, path: string, payload: Uint8Array): string {
    if ((hardware as any).writeFile !== undefined) {
        return (hardware as any).writeFile(path, encode(payload));
    }

    const bufferSize = 4 * 1024 * 1024; // 4 mb

    let error = hardware.createFile(path);
    if (error.length > 0) {
        return error;
    }

    let cursor = 0;
    while (cursor < payload.length) {
        const size = Math.min(bufferSize, payload.length - cursor);
        const chunk = payload.subarray(cursor, cursor + size);
        error = hardware.appendFile(encode(chunk));
        if (error.length > 0) {
            return error;
        }
        cursor += size;
    }

    error = hardware.closeFile();
    return error;
}

function decode(input: string): Uint8Array {
    return base64.toByteArray(input);
}

function encode(input: Uint8Array): string {
    return base64.fromByteArray(input);
}
