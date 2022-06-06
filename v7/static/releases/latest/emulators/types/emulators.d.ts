import DosBundle from "./dos/bundle/dos-bundle";
import { DosConfig } from "./dos/bundle/dos-conf";
import { TransportLayer } from "./protocol/protocol";
export declare enum NetworkType {
    NETWORK_DOSBOX_IPX = 0
}
export interface BackendOptions {
    onExtractProgress?: (bundleIndex: number, file: string, extracted: number, total: number) => void;
}
export interface Emulators {
    pathPrefix: string;
    version: string;
    wdosboxJs: string;
    dosBundle: () => Promise<DosBundle>;
    dosboxNode: (bundle: Uint8Array | Uint8Array[], options?: BackendOptions) => Promise<CommandInterface>;
    dosboxDirect: (bundle: Uint8Array | Uint8Array[], options?: BackendOptions) => Promise<CommandInterface>;
    dosboxWorker: (bundle: Uint8Array | Uint8Array[], options?: BackendOptions) => Promise<CommandInterface>;
    janus: (restUrl: string) => Promise<CommandInterface>;
    backend: (bundle: Uint8Array | Uint8Array[], transportLayer: TransportLayer, options?: BackendOptions) => Promise<CommandInterface>;
}
export interface DirectSound {
    ringSize: number;
    bufferSize: number;
    buffer: Float32Array[];
}
export interface CommandInterface {
    config: () => Promise<DosConfig>;
    height: () => number;
    width: () => number;
    soundFrequency: () => number;
    screenshot: () => Promise<ImageData>;
    pause: () => void;
    resume: () => void;
    mute: () => void;
    unmute: () => void;
    exit: () => Promise<void>;
    simulateKeyPress: (...keyCodes: number[]) => void;
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;
    sendMouseMotion: (x: number, y: number) => void;
    sendMouseRelativeMotion: (x: number, y: number) => void;
    sendMouseButton: (button: number, pressed: boolean) => void;
    sendMouseSync: () => void;
    persist(): Promise<Uint8Array>;
    events(): CommandInterfaceEvents;
    networkConnect(networkType: NetworkType, address: string, port: number): Promise<void>;
    networkDisconnect(networkType: NetworkType): Promise<void>;
    sharedMemory?: SharedArrayBuffer;
    directSound?: DirectSound;
}
export declare type MessageType = "log" | "warn" | "error" | string;
export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (rgb: Uint8Array | null, rgba: Uint8Array | null) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;
    onNetworkConnected: (consumer: (networkType: NetworkType, address: string, port: number) => void) => void;
    onNetworkDisconnected: (consumer: (networkType: NetworkType) => void) => void;
}
