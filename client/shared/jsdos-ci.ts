// # DosCommandInterface
// Is abstraction that allows you to control runned instance of jsdos

export interface DosKeyEventConsumer {
    onPress(keyCode: number): void;
    onRelease(keyCode: number): void;
}

export interface DosCommandInterface {
    // * `fullscreen()` - enters fullscreen mode
    // This function can be called anywhere, but for web security reasons its associated request can only be raised
    // inside the event handler for a user-generated event (for example a key, mouse or touch press/release).
    fullscreen: () => void;

    // * `exitFullscreen()` allows you to leave fullscreen entered with `fullscreen()` call
    exitFullscreen: () => void;

    // * `listenStdout()` - redirect everything that printed by dosbox into
    // console to passed function
    listenStdout: (onstdout: (data: string) => void) => void;

    // * `shell([cmd1, cmd2, ...])` - executes passed commands
    // in dosbox shell if it's runned, returns Promise that
    // resolves when commands sequence is executed
    shell: (...cmd: string[]) => void;

    // * `screenshot()` - get screnshot of canvas as ImageData 
    screenshot: () => Promise<ImageData>;

    // * `exit()` - exit from runtime
    exit: () => Promise<void>;

    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode
    simulateKeyPress: (keyCode: number) => void;
}
