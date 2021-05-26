import DosBundle from "./dos/bundle/dos-bundle";
import { Cache } from "./cache";
import { DosConfig } from "./dos/bundle/dos-conf";
import { TransportLayer } from "./protocol/protocol";
export interface Emulators {
    pathPrefix: string;
    cacheSeed: string;
    cache: (cacheName?: string) => Promise<Cache>;
    dosBundle: () => Promise<DosBundle>;
    dosboxNode: (bundle: Uint8Array | Uint8Array[]) => Promise<CommandInterface>;
    dosboxDirect: (bundle: Uint8Array | Uint8Array[]) => Promise<CommandInterface>;
    dosboxWorker: (bundle: Uint8Array | Uint8Array[]) => Promise<CommandInterface>;
    janus: (restUrl: string) => Promise<CommandInterface>;
    backend: (bundle: Uint8Array | Uint8Array[], transportLayer: TransportLayer) => Promise<CommandInterface>;
}
export interface CommandInterface {
    config: () => Promise<DosConfig>;
    height: () => number;
    width: () => number;
    soundFrequency: () => number;
    screenshot: () => Promise<ImageData>;
    exit: () => Promise<void>;
    simulateKeyPress: (...keyCodes: number[]) => void;
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;
    sendMouseMotion: (x: number, y: number) => void;
    sendMouseButton: (button: number, pressed: boolean) => void;
    persist(): Promise<Uint8Array>;
    events(): CommandInterfaceEvents;
}
export declare type MessageType = "log" | "warn" | "error" | string;
export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (rgb: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;
}
