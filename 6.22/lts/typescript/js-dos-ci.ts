// # DosCommandInterface
// Is abstraction that allows you to control runned instance of js-dos
import { DosModule } from "./js-dos-module";

export interface DosKeyEventConsumer {
    onPress(keyCode: number): void;
    onRelease(keyCode: number): void;
}
export class DosCommandInterface {
    public dos: DosModule;
    private em: any; // typeof Module;
    private api: LowLevelApi;
    private onready: (ci: DosCommandInterface) => void;

    private shellInputQueue: string[] = [];
    private shellInputClients: Array<() => void> = [];
    private onstdout?: (data: string) => void = undefined;
    private keyEventConsumer: DosKeyEventConsumer = {
        onPress: (keyCode) => this.simulateKeyEvent(keyCode, true),
        onRelease: (keyCode) => this.simulateKeyEvent(keyCode, false),
    };
    private fullscreenInitialCssStyle?: string;

    constructor(dos: DosModule, onready: (ci: DosCommandInterface) => void) {
        this.dos = dos;
        this.em = (dos as any);
        this.api = (dos as any);
        this.api.ping = (msg: string, ...args: any[]) => {
            this.onping(msg, args);
        };
        this.onready = onready;
    }

    // * `width()` - return dosbox window width in pixels
    public width() {
        return this.dos.canvas.width;
    }

    // * `height()` - return dosbox window height in pixels
    public height() {
        return this.dos.canvas.height;
    }

    // * `fullscreen()` - enters fullscreen mode
    // This function can be called anywhere, but for web security reasons its associated request can only be raised
    // inside the event handler for a user-generated event (for example a key, mouse or touch press/release).
    public fullscreen() {
        const requestFn = (element: any) => {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.webkitEnterFullscreen) {
                element.webkitEnterFullscreen();
            } else {
                this.fullscreenInitialCssStyle = (element as HTMLElement).style.cssText;
                (element as HTMLElement).style.cssText = `
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    background: black;
                    z-index: 999;
                `;
            }
        };

        const parent = this.getParentDiv();
        if (parent !== null && parent.className === "dosbox-container") {
            requestFn(parent);
        } else {
            requestFn(this.dos.canvas);
        }
    }

    // * `exitFullscreen()` allows you to leave fullscreen entered with `fullscreen()` call
    public exitFullscreen() {
        const requestFn = (element: any) => {
            if (this.fullscreenInitialCssStyle !== undefined) {
                (element as HTMLElement).style.cssText = this.fullscreenInitialCssStyle;
                delete this.fullscreenInitialCssStyle;
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        };

        const parent = this.getParentDiv();
        if (parent !== null && parent.className === "dosbox-container") {
            requestFn(parent);
        } else {
            requestFn(this.dos.canvas);
        }
    }

    // * `listenStdout()` - redirect everything that printed by dosbox into
    // console to passed function
    public listenStdout(onstdout: (data: string) => void) {
        this.onstdout = onstdout;
    }

    // * `shell([cmd1, cmd2, ...])` - executes passed commands
    // in dosbox shell if it's runned, returns Promise that
    // resolves when commands sequence is executed
    public shell(...cmd: string[]) {
        if (cmd.length === 0) {
            return;
        }

        return new Promise((resolve, reject) => {
            this.shellInputClients.push(resolve);
            for (const next of cmd) {
                this.shellInputQueue.push(next);
            }
            this.requestShellInput();
        });
    }

    // * `screenshot()` - get screnshot of canvas as ImageData
    public screenshot() {
        return new Promise((resolve) => {
            this.api.send("screenshot", "", (data) => {
                resolve(data);
            });
        });
    }

    // * `exit()` - immediately exit from runtime
    public exit() {
        try {
            this.dos.terminate();
            this.api.send("exit");
        } catch (e) {
            return 0;
        }

        this.dos.error("Runtime is still alive!");
        return -1;
    }

    // * `simulateKeyEvent(keyCode, pressed)` - allows to simulate key press OR release on js-dos canvas
    public simulateKeyEvent(keyCode: number, pressed: boolean): void {
        const name = pressed ? "keydown" : "keyup";
        const event = document.createEvent("KeyboardEvent") as any;
        const getter: any = {
            get() {
                return this.keyCodeVal;
            },
        };

        // Chromium Hack
        Object.defineProperty(event, "keyCode", getter);
        Object.defineProperty(event, "which", getter);
        Object.defineProperty(event, "charCode", getter);

        event.initKeyboardEvent
            ? event.initKeyboardEvent(name, true, true, document.defaultView, false, false, false, false, keyCode, keyCode)
            : event.initKeyEvent(name, true, true, document.defaultView, false, false, false, false, keyCode, 0);

        event.keyCodeVal = keyCode;
        this.dos.canvas && this.dos.canvas.dispatchEvent(event);
    }

    // * `simulateKeyPress(keyCode)` - allows to simulate key press AND release on js-dos canvas
    public simulateKeyPress(keyCode: number): void {
        this.simulateKeyEvent(keyCode, true);
        setTimeout(() => this.simulateKeyEvent(keyCode, false), 100);
    }

    public getParentDiv(): HTMLDivElement | null {
        if (this.dos.canvas.parentElement instanceof HTMLDivElement) {
            return this.dos.canvas.parentElement;
        }

        return null;
    }

    public getKeyEventConsumer(): DosKeyEventConsumer {
        return this.keyEventConsumer;
    }

    private sendKeyPress(code: number) {
        this.api.send("sdl_key_event", code + "");
    }

    private requestShellInput() {
        this.sendKeyPress(13);
    }

    private onping(msg: string, args: any[]) {
        switch (msg) {
            case "ready":
                this.onready(this);
                break;
            case "frame":
                this.onframe();
                break;
            case "shell_input":
                if (this.shellInputQueue.length === 0) {
                    return;
                }

                const buffer: number = args[0];
                const maxLength: number = args[1];

                const cmd = this.shellInputQueue.shift();
                const cmdLength = this.em.lengthBytesUTF8(cmd) + 1;

                if (cmdLength > maxLength) {
                    if (this.dos.onerror !== undefined) {
                        this.dos.onerror("Can't execute cmd '" + cmd +
                            "', because it's bigger then max cmd length " + maxLength);
                    }
                    return;
                }

                this.em.stringToUTF8(cmd, buffer, cmdLength);

                if (this.shellInputQueue.length === 0) {
                    for (const resolve of this.shellInputClients) {
                        resolve();
                    }
                    this.shellInputClients = [];
                } else {
                    this.requestShellInput();
                }
                break;
            case "write_stdout":
                const data: string = args[0];
                if (this.onstdout) {
                    this.onstdout(data);
                }
                break;
            default:
            /* do nothing */
        }
    }

    private onframe() {
        this.dos.tick();
    }

}

interface LowLevelApi {
    send: (event: string, msg?: any, callback?: (msg: string) => void) => void;
    ping: (msg: string) => void;
}
