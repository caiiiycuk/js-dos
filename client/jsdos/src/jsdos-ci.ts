// # DosCommandInterface
// Is abstraction that allows you to control runned instance of js-dos
import { DosKeys } from "./jsdos-controller";
import { DosConfig } from "./jsdos-options";
import { DosMiddleware } from "./jsdos-middleware";

export interface DosKeyEventConsumer {
    onPress(keyCode: number): void;
    onRelease(keyCode: number): void;
}
export class DosCommandInterface {
    public config: DosConfig;
    public middleware: DosMiddleware;

    private shellInputQueue: string[] = [];
    private shellInputClients: Array<() => void> = [];
    private onstdout?: (data: string) => void = undefined;
    private keyEventConsumer: DosKeyEventConsumer = {
        onPress: (keyCode) => this.sendKeyEvent(keyCode, true),
        onRelease: (keyCode) => this.sendKeyEvent(keyCode, false),
    };
    private fullscreenInitialCssStyle?: string;

    constructor(config: DosConfig,
                middleware: DosMiddleware,
                ready: (ci: DosCommandInterface) => void) {
        this.config = config;
        this.middleware = middleware;

        this.middleware.onReady(() => { ready(this); });
        this.middleware.onFrame(() => { /**/ });
        this.middleware.onShellInput(() => this.onShellInput());
        this.middleware.onStdout((message: string) => {/**/});
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
            requestFn(this.config.element);
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
            requestFn(this.config.element);
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
            this.middleware.requestScreenshot((data) => {
                resolve(data);
            });
        });
    }

    // * `exit()` - immediately exit from runtime
    public exit() {
        try {
            this.middleware.exit();
        } catch (e) {
        }

        return 0;
    }


    // * `simulateKeyPress(keyCode)` - allows to simulate key press **AND** release event for key code
    // see `sendKeyPress` to find meaning of keyCode
    public simulateKeyPress(keyCode: number): void {
        this.sendKeyEvent(keyCode, true);
        setTimeout(() => this.sendKeyEvent(keyCode, false), 100);
    }

    public getParentDiv(): HTMLDivElement | null {
        if (this.config.element.parentElement instanceof HTMLDivElement) {
            return this.config.element.parentElement;
        }

        return null;
    }

    public getKeyEventConsumer(): DosKeyEventConsumer {
        return this.keyEventConsumer;
    }

    // * `sendKeyEvent(keyCode, pressed)` - use to send key press **OR** release event
    // **keyCode** is a key code. Key codes are the same names and values as GLFW.
    // To check the key code, look in ./dreamlayers-em-dosbox-em-dosbox-svn-sdl2/include/keyboard.h
    // **pressed** is a flag that mean if key pressed or not
    private sendKeyEvent(keyCode: number, pressed: boolean) {
        this.middleware.sendkey(keyCode, pressed);
    }

    private requestShellInput() {
        this.sendKeyEvent(DosKeys.KBD_enter, true);
        this.sendKeyEvent(DosKeys.KBD_enter, false);
    }

    private onShellInput() {
        if (this.shellInputQueue.length === 0) {
            return;
        }

        this.requestShellInput();
    }

}
