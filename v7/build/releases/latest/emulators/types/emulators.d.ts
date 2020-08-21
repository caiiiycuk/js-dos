import DosBundle from "./dos/bundle/dos-bundle";
import { Cache } from "./cache";
import { DosConfig } from "./dos/bundle/dos-conf";
export interface Emulators {
    pathPrefix: string;
    cache: () => Promise<Cache>;
    dosBundle: () => Promise<DosBundle>;
    dosDirect: (bundle: Uint8Array) => Promise<CommandInterface>;
    dosWorker: (bundle: Uint8Array) => Promise<CommandInterface>;
}
export interface CommandInterface {
    config: () => Promise<DosConfig>;
    height: () => number;
    width: () => number;
    soundFrequency: () => number;
    screenshot: () => Promise<ImageData>;
    exit: () => Promise<void>;
    simulateKeyPress: (keyCode: number) => void;
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;
    persist(): Promise<Uint8Array>;
    events(): CommandInterfaceEvents;
}
export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (frame: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
}
export interface Logger {
    onLog: (...args: any[]) => void;
    onWarn: (...args: any[]) => void;
    onErr: (...args: any[]) => void;
}
