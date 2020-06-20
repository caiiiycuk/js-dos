import DosBundle from "./dos/bundle/dos-bundle";
import emulatorsImpl from "./impl/emulators-impl";

export interface Emulators {
    pathPrefix: string;
    dosBundle: () => Promise<DosBundle>;
    dosDirect: (bundle: Uint8Array) => Promise<CommandInterface>;
    dosWorker: (bundle: Uint8Array) => Promise<CommandInterface>;
}

export interface CommandInterface {
    // * `screenshot()` - get screnshot of canvas as ImageData
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode
    simulateKeyPress: (keyCode: number) => void;

    sendKeyEvent: (keyCode: number, pressed: boolean) => void;

    // dump FS as Uint8Array <zip archive>
    persist(): Promise<Uint8Array>;

    // events
    events(): CommandInterfaceEvents;
}

export interface CommandInterfaceEvents {
    onStdout: (consumer: (message: string) => void | null) => void;
    onFrameSize: (consumer: (width: number, height: number) => void | null) => void;
    onFrame: (consumer: (frame: Uint8ClampedArray) => void | null) => void;
}


export interface Logger {
    onLog: (...args: any[]) => void;
    onWarn: (...args: any[]) => void;
    onErr: (...args: any[]) => void;
}

if (typeof window !== undefined) {
    (window as any).Emulators = emulatorsImpl;
}

(window as any).emulators = emulatorsImpl;

