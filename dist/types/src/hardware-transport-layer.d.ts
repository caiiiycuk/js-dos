import { TransportLayer } from "emulators/dist/types/protocol/protocol";
export interface Hardware {
    readConfig(): string;
    sendMessage(payload: string): void;
    addKey(key: number, pressed: number, timeMs: number): void;
    mouseMove(x: number, y: number, relative: boolean, timeMs: number): void;
    mouseButton(button: number, pressed: number, timeMs: number): void;
    getFramePayload(): string;
    writeFile(path: string, blob: string): string;
}
export declare class HardwareTransportLayerFactory {
    private serverMessageHandler;
    constructor();
    createTransportLayer(realtime: Hardware): TransportLayer;
}
export declare const hardwareTransportLayerFactory: HardwareTransportLayerFactory;
