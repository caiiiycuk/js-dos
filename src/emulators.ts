import DosBundle from "./dos/bundle/dos-bundle";
import emulatorsImpl from "./impl/emulators-impl";

import { Cache } from "./cache";
import { Keys } from "./keys";
import { DosConfig } from "./dos/bundle/dos-conf";

export interface Emulators {
    pathPrefix: string;
    cache: () => Promise<Cache>;
    dosBundle: () => Promise<DosBundle>;
    dosDirect: (bundle: Uint8Array) => Promise<CommandInterface>;
    dosWorker: (bundle: Uint8Array) => Promise<CommandInterface>;
}

export interface CommandInterface {
    // * get bundle config
    config: () => Promise<DosConfig>;

    // * current render buffer width
    height: () => number;

    // * current render buffer height
    width: () => number;

    // * sound frequency
    soundFrequency: () => number;

    // * `screenshot()` - get screnshot of canvas as ImageData
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(...keyCodes)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode. Key combination is suported when more than 1 keyCode is set.
    simulateKeyPress: (...keyCodes: number[]) => void;

    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // dump FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;

    // events
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

if (typeof window !== undefined) {
    (window as any).emulators = emulatorsImpl;
}
