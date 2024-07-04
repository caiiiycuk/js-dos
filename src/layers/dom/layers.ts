import { Notyf } from "notyf";
import Keyboard from "simple-keyboard";
import { createDiv, stopPropagation } from "./helpers";

/* eslint-disable camelcase */
import { domToKeyCode, KBD_enter, KBD_leftshift,
    KBD_backspace, KBD_capslock, KBD_tab, KBD_space, KBD_esc,
    KBD_leftctrl, KBD_leftalt, KBD_comma, KBD_period, KBD_quote,
    KBD_semicolon, KBD_leftbracket, KBD_rightbracket, KBD_up, KBD_down, KBD_left, KBD_right,
} from "./keys";
/* eslint-enable camelcase */

// eslint-disable-next-line
const elementResizeDetector = require("element-resize-detector");
const resizeDetector = elementResizeDetector({
});

// eslint-disable-next-line
export interface LayersOptions {
    optionControls?: string[];
    keyboardDiv?: HTMLDivElement;
    keyboardInputDiv?: HTMLDivElement;
    fullscreenElement?: HTMLElement;
}

export function layers(root: HTMLDivElement, options?: LayersOptions) {
    return new Layers(root, options || {});
}

export class Layers {
    options: LayersOptions;
    root: HTMLDivElement;
    loading: HTMLDivElement;
    canvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    mouseOverlay: HTMLDivElement;
    width: number;
    height: number;
    fullscreen = false;
    keyboardVisible = false;
    pointerLock = false;
    pointerDisabled = false;
    pointerButton: 0 | 1 = 0;

    notyf = new Notyf();
    toggleKeyboard: () => boolean = () => false;

    private fullscreenElement: HTMLElement;
    private clickToStart: HTMLDivElement;
    private loaderText: HTMLPreElement;
    private onResize: ((width: number, height: number) => void)[];

    private onKeyDown: (keyCode: number) => void;
    private onKeyUp: (keyCode: number) => void;
    private onKeyPress: (keyCode: number) => void;
    private onKeysPress: (keyCodes: number[]) => void;

    private onSave: () => Promise<void>;
    private onSaveStarted: () => void;
    private onSaveEnded: () => void;

    private onFullscreenChanged: ((fullscreen: boolean) => void)[] = [];
    private onKeyboardChanged: ((visible: boolean) => void)[] = [];

    // eslint-disable-next-line
    constructor(root: HTMLDivElement, options: LayersOptions) {
        this.options = options;
        this.root = root;
        this.root.classList.add("emulator-root");
        this.fullscreenElement = options.fullscreenElement || this.root;

        this.canvas = document.createElement("canvas");
        this.canvas.className = "emulator-canvas";

        this.video = document.createElement("video");
        this.video.setAttribute("autoplay", "");
        this.video.setAttribute("playsinline", "");
        this.video.className = "emulator-video";

        this.loading = createLoadingLayer();
        this.loaderText = this.loading.querySelector(".emulator-loading-pre-2") as HTMLPreElement;
        this.mouseOverlay = createMouseOverlayLayer();

        this.clickToStart = createClickToStartLayer();
        this.clickToStart.onclick = () => {
            this.clickToStart.style.display = "none";
            this.video.play();
        };

        this.root.appendChild(this.canvas);
        this.root.appendChild(this.video);
        this.root.appendChild(this.mouseOverlay);
        this.root.appendChild(this.clickToStart);
        this.root.appendChild(this.loading);

        this.width = root.offsetWidth;
        this.height = root.offsetHeight;

        this.onResize = [];
        this.onKeyDown = () => {/**/};
        this.onKeyUp = () => {/**/};
        this.onKeyPress = () => {/**/};
        this.onKeysPress = () => {/**/};
        this.onSave = () => {
            return Promise.reject(new Error("Not implemented"));
        };
        this.onSaveStarted = () => {/**/};
        this.onSaveEnded = () => {/**/};

        resizeDetector.listenTo(this.root, (el: HTMLElement) => {
            if (el !== root) {
                return;
            }

            this.width = el.offsetWidth;
            this.height = el.offsetHeight;
            for (const next of this.onResize) {
                next(this.width, this.height);
            }
        });

        this.initKeyEvents();
        this.initKeyboard();
        this.preventContextMenu();


        this.fullscreenElement.onfullscreenchange = () => {
            if (document.fullscreenElement !== this.fullscreenElement) {
                this.fullscreen = false;
                for (const next of this.onFullscreenChanged) {
                    next(this.fullscreen);
                }
            }
        };
    }

    private initKeyEvents() {
        const keyboardInput = this.options.keyboardInputDiv ?? this.root;
        keyboardInput.style.outline = "none";
        if (!keyboardInput.tabIndex || keyboardInput.tabIndex === -1) {
            keyboardInput.tabIndex = 0;
        }
        keyboardInput.addEventListener("keydown", (e) => {
            const keyCode = domToKeyCode(e.keyCode);
            this.onKeyDown(keyCode);
            e.stopPropagation();
            e.preventDefault();
        });
        keyboardInput.addEventListener("keyup", (e) => {
            const keyCode = domToKeyCode(e.keyCode);
            this.onKeyUp(keyCode);
            e.stopPropagation();
            e.preventDefault();
        });
    }

    preventContextMenu() {
        this.root.addEventListener("contextmenu", (e) => {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
    }

    addOnResize(handler: (width: number, height: number) => void) {
        this.onResize.push(handler);
    }

    removeOnResize(handler: (width: number, height: number) => void) {
        this.onResize = this.onResize.filter((n) => n !== handler);
    }

    setOnKeyDown(handler: (keyCode: number) => void) {
        this.onKeyDown = handler;
    }

    fireKeyDown(keyCode: number) {
        this.onKeyDown(keyCode);
    }

    setOnKeyUp(handler: (keyCode: number) => void) {
        this.onKeyUp = handler;
    }

    fireKeyUp(keyCode: number) {
        this.onKeyUp(keyCode);
    }

    setOnKeyPress(handler: (keyCode: number) => void) {
        this.onKeyPress = handler;
    }

    fireKeyPress(keyCode: number) {
        this.onKeyPress(keyCode);
    }

    setOnKeysPress(handler: (keyCodes: number[]) => void) {
        this.onKeysPress = handler;
    }


    fireKeysPress(keyCodes: number[]) {
        this.onKeysPress(keyCodes);
    }

    toggleFullscreen() {
        if (this.fullscreen) {
            this.fullscreen = false;
            if (this.fullscreenElement.classList.contains("emulator-fullscreen-workaround")) {
                this.fullscreenElement.classList.remove("emulator-fullscreen-workaround");
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
            for (const next of this.onFullscreenChanged) {
                next(false);
            }
        } else {
            this.fullscreen = true;
            const element = this.fullscreenElement as any;
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
                this.fullscreenElement.classList.add("emulator-fullscreen-workaround");
            }
            for (const next of this.onFullscreenChanged) {
                next(true);
            }
        }
    }

    setOnFullscreen(onFullscreenChanged: (fullscreen: boolean) => void) {
        this.onFullscreenChanged.push(onFullscreenChanged);
    }

    removeOnFullscreen(onFullscreenChanged: (visible: boolean) => void) {
        this.onFullscreenChanged = this.onFullscreenChanged.filter((n) => n !== onFullscreenChanged);
    }

    setOnKeyboardVisibility(onKeyboardChanged: (visible: boolean) => void) {
        this.onKeyboardChanged.push(onKeyboardChanged);
    }

    removeOnKeyboardVisibility(onKeyboardChanged: (visible: boolean) => void) {
        this.onKeyboardChanged = this.onKeyboardChanged.filter((n) => n !== onKeyboardChanged);
    }

    save(): Promise<void> {
        this.onSaveStarted();
        return this.onSave()
            .then(() => {
                this.notyf.success("Saved");
                this.onSaveEnded();
            })
            .catch((error) => {
                this.notyf.error(error.message);
                this.onSaveEnded();
            });
    }

    setOnSave(handler: () => Promise<void>) {
        this.onSave = handler;
    }

    getOnSave() {
        return this.onSave;
    }

    setOnSaveStarted(callback: () => void) {
        this.onSaveStarted = callback;
    }

    setOnSaveEnded(callback: () => void) {
        this.onSaveEnded = callback;
    }

    hideLoadingLayer() {
        this.loading.style.visibility = "hidden";
    }

    showLoadingLayer() {
        this.loading.style.visibility = "visible";
    }

    setLoadingMessage(message: string) {
        this.loaderText.innerHTML = message;
    }

    switchToVideo() {
        this.video.style.display = "block";
        this.canvas.style.display = "none";
    }

    showClickToStart() {
        this.clickToStart.style.display = "flex";
    }

    private initKeyboard() {
        let keyboardVisible = false;

        const layout = {
            en: [
                "{esc} ` 1 2 3 4 5 6 7 8 9 0 () - = {bksp} {enter}",
                "{tab} q w e r t y u i o p { } \\ {up}",
                "{shift} {left} {right} a s d f g h j k l ; ' [ {down}",
                "⎘ {alt} {ctrl} z x c v b n m , . / ] {space}",
            ],
        };
        const enLayoutDisplay = {
            "{esc}": "␛",
            "{bksp}": "⌫",
            "{enter}": "↵",
            "{space}": "Space",
            "{up}": "↑",
            "{down}": "↓",
            "{left}": "←",
            "{right}": "→",
            "{shift}": "⇑",
            "{ctrl}": "Ctrl",
            "{alt}": "Alt",
            "{tab}": "Tab",
        };
        const ruLayoutDisplay = {
            "{esc}": "␛",
            "{bksp}": "⌫",
            "{enter}": "↵",
            "{space}": "Space",
            "{up}": "↑",
            "{down}": "↓",
            "{left}": "←",
            "{right}": "→",
            "{shift}": "⇑",
            "{alt}": "Alt",
            "{ctrl}": "Ctrl",
            "{tab}": "Tab",
            "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е",
            "y": "н", "u": "г", "i": "ш", "o": "щ", "p": "з",
            "{": "х", "}": "ъ", "a": "ф", "s": "ы", "d": "в",
            "f": "а", "g": "п", "h": "р", "j": "о", "k": "л",
            "l": "д", ";": "ж", "'": "э", "z": "я", "x": "ч",
            "c": "с", "v": "м", "b": "и", "n": "т", "m": "ь",
            ",": "б", ".": "ю",
        };
        const displayOrder = [enLayoutDisplay, ruLayoutDisplay];
        let displayIndex = 0;

        const keyboardDiv = this.options.keyboardDiv || createDiv("");
        keyboardDiv.classList.add("emulator-keyboard");
        keyboardDiv.style.display = "none";
        stopPropagation(keyboardDiv);

        const keyboard = new Keyboard(keyboardDiv, {
            layout,
            layoutName: "en",
            display: displayOrder[displayIndex],
            onKeyPress: (button: string) => {
                if (button === "⎘") {
                    return;
                }

                const keyCodes = buttonToCode(button);
                for (const keyCode of keyCodes) {
                    this.fireKeyDown(keyCode);
                }
            },
            onKeyReleased: (button: string) => {
                if (button === "⎘") {
                    displayIndex = (displayIndex + 1) % displayOrder.length;
                    keyboard.setOptions({
                        display: displayOrder[displayIndex],
                    });
                    return;
                }

                const keyCodes = buttonToCode(button);
                for (const keyCode of keyCodes) {
                    this.fireKeyUp(keyCode);
                }
            },
            preventMouseDownDefault: true,
            preventMouseUpDefault: true,
            stopMouseDownPropagation: true,
            stopMouseUpPropagation: true,
            physicalKeyboardHighlight: false,
            physicalKeyboardHighlightPress: false,
            physicalKeyboardHighlightPressUseClick: false,
            physicalKeyboardHighlightPressUsePointerEvents: false,
        });

        this.toggleKeyboard = () => {
            keyboardVisible = !keyboardVisible;
            const display = keyboardVisible ? "block" : "none";
            keyboardDiv.style.display = display;

            for (const next of this.onKeyboardChanged) {
                next(keyboardVisible);
            }

            this.keyboardVisible = keyboardVisible;
            return keyboardVisible;
        };

        if (!this.options.keyboardDiv) {
            this.mouseOverlay.appendChild(keyboardDiv);
        }
    }
}

function createLoadingLayer() {
    return createDiv("emulator-loading", `
<div class='emulator-loading-inner'>
<pre class='emulator-loading-pre-1'>
        _                __
       (_)____      ____/ /___  _____ _________  ____ ___
      / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
     / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
  __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/
 /___/
</pre>
<pre class='emulator-loading-pre-2'>
</pre>
<div class='emulator-loader'>
</div>
</div>
`);
}

function createMouseOverlayLayer() {
    return createDiv("emulator-mouse-overlay", "");
}

function createClickToStartLayer() {
    return createDiv("emulator-click-to-start-overlay", `
<div class="emulator-click-to-start-text">Press to start</div>
<div class="emulator-click-to-start-icon"></div>
`);
}

/* eslint-disable camelcase */
function buttonToCode(button: string): number[] {
    if (button.length > 1) {
        if (button === "{enter}") {
            return [KBD_enter];
        } else if (button === "{shift}") {
            return [KBD_leftshift];
        } else if (button === "{bksp}") {
            return [KBD_backspace];
        } else if (button === "{lock}") {
            return [KBD_capslock];
        } else if (button === "{tab}") {
            return [KBD_tab];
        } else if (button === "{space}") {
            return [KBD_space];
        } else if (button === "{esc}") {
            return [KBD_esc];
        } else if (button === "{ctrl}") {
            return [KBD_leftctrl];
        } else if (button === "{alt}") {
            return [KBD_leftalt];
        } else if (button === "{up}") {
            return [KBD_up];
        } else if (button === "{down}") {
            return [KBD_down];
        } else if (button === "{left}") {
            return [KBD_left];
        } else if (button === "{right}") {
            return [KBD_right];
        } else {
            console.warn("Unknown button", button);
            return [];
        }
    } else if (button === ",") {
        return [KBD_comma];
    } else if (button === ".") {
        return [KBD_period];
    } else if (button === "'") {
        return [KBD_quote];
    } else if (button === ":") {
        return [KBD_semicolon];
    } else if (button === "{") {
        return [KBD_leftshift, KBD_leftbracket];
    } else if (button === "}") {
        return [KBD_leftshift, KBD_rightbracket];
    }

    const keyCode = domToKeyCode(button.toUpperCase().charCodeAt(0));
    if (keyCode === 0) {
        return [];
    }

    return [keyCode];
}

/* eslint-enable camelcase */
