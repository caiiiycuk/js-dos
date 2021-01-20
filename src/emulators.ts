import DosBundle from "./dos/bundle/dos-bundle";
import emulatorsImpl from "./impl/emulators-impl";

import { Cache } from "./cache";
import { Keys } from "./keys";
import { DosConfig } from "./dos/bundle/dos-conf";

export interface Emulators {
    // * pathPrefix - by default emulators will load wasm modules relatively from current path,
    // you should specify path prefix if you want to load them from different place
    pathPrefix: string;

    // * cache - default cache that store wasm binaries, this cache is wiped on any js-dos version change
    cache: (seed?: string) => Promise<Cache>;

    dosBundle: () => Promise<DosBundle>;

    // * dosDirect - create DOS Direct emulator backend
    dosDirect: (bundle: Uint8Array) => Promise<CommandInterface>;

    // * dosWorker - create DOS Worker emulator backend
    dosWorker: (bundle: Uint8Array) => Promise<CommandInterface>;

    janus: (restUrl: string) => Promise<CommandInterface>;
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

    // * `sendKeyEvent(keyCode, pressed)` - sends single key (press or release) event to backend
    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // * `simulateMouseMotion` - sends mouse motion event to backend
    sendMouseMotion: (x: number, y: number) => void;

    // * `simulateMouseButton` - sends mouse button event (press or release) to backend
    sendMouseButton: (button: number, pressed: boolean) => void;

    // dump FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;

    // events
    events(): CommandInterfaceEvents;
}

export type MessageType = "log" | "warn" | "error" | string;

export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (frame: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;

    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;
}

if (typeof window !== undefined) {
    (window as any).emulators = emulatorsImpl;
}
