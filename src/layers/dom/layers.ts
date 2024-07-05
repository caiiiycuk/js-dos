import { createDiv, stopPropagation } from "./helpers";

/* eslint-disable camelcase */
import { domToKeyCode, KBD_enter, KBD_leftshift,
    KBD_backspace, KBD_capslock, KBD_tab, KBD_space, KBD_esc,
    KBD_leftctrl, KBD_leftalt, KBD_comma, KBD_period, KBD_quote,
    KBD_semicolon, KBD_leftbracket, KBD_rightbracket, KBD_up, KBD_down, KBD_left, KBD_right,
} from "./keys";
/* eslint-enable camelcase */

// eslint-disable-next-line
export interface LayersOptions {
    optionControls?: string[];
    keyboardDiv?: HTMLDivElement;
    keyboardInputDiv?: HTMLDivElement;
}

export class Layers {
    options: LayersOptions;
    root: HTMLDivElement;
    canvas: HTMLCanvasElement;
    mouseOverlay: HTMLDivElement;
    width: number;
    height: number;
    keyboardVisible = false;
    pointerLock = false;
    pointerDisabled = false;
    pointerButton: 0 | 1 = 0;

    toggleKeyboard: () => boolean = () => false;

    private onResize: ((width: number, height: number) => void)[];

    private onKeyDown: (keyCode: number) => void;
    private onKeyUp: (keyCode: number) => void;
    private onKeyPress: (keyCode: number) => void;
    private onKeysPress: (keyCodes: number[]) => void;

    private onKeyboardChanged: ((visible: boolean) => void)[] = [];

    // eslint-disable-next-line
    constructor(root: HTMLDivElement, canvas: HTMLCanvasElement, options: LayersOptions) {
        this.options = options;
        this.root = root;
        this.root.classList.add("emulator-root");

        this.canvas = canvas;
        this.canvas.className = "emulator-canvas";
        this.mouseOverlay = createMouseOverlayLayer();

        this.root.appendChild(this.mouseOverlay);

        this.width = root.offsetWidth;
        this.height = root.offsetHeight;

        this.onResize = [];
        this.onKeyDown = () => {/**/};
        this.onKeyUp = () => {/**/};
        this.onKeyPress = () => {/**/};
        this.onKeysPress = () => {/**/};

        new ResizeObserver((entries) => {
            for (const e of entries) {
                if (e.target === root) {
                    this.width = e.contentRect.width;
                    this.height = e.contentRect.height;
                    for (const next of this.onResize) {
                        next(this.width, this.height);
                    }
                }
            }
        }).observe(this.root);

        this.initKeyEvents();
        this.initKeyboard();
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

    setOnKeyboardVisibility(onKeyboardChanged: (visible: boolean) => void) {
        this.onKeyboardChanged.push(onKeyboardChanged);
    }

    removeOnKeyboardVisibility(onKeyboardChanged: (visible: boolean) => void) {
        this.onKeyboardChanged = this.onKeyboardChanged.filter((n) => n !== onKeyboardChanged);
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
        const displayIndex = 0;

        const keyboardDiv = this.options.keyboardDiv || createDiv("");
        keyboardDiv.classList.add("emulator-keyboard");
        keyboardDiv.style.display = "none";
        stopPropagation(keyboardDiv);

        // const keyboard = new Keyboard(keyboardDiv, {
        //     layout,
        //     layoutName: "en",
        //     display: displayOrder[displayIndex],
        //     onKeyPress: (button: string) => {
        //         if (button === "⎘") {
        //             return;
        //         }

        //         const keyCodes = buttonToCode(button);
        //         for (const keyCode of keyCodes) {
        //             this.fireKeyDown(keyCode);
        //         }
        //     },
        //     onKeyReleased: (button: string) => {
        //         if (button === "⎘") {
        //             displayIndex = (displayIndex + 1) % displayOrder.length;
        //             keyboard.setOptions({
        //                 display: displayOrder[displayIndex],
        //             });
        //             return;
        //         }

        //         const keyCodes = buttonToCode(button);
        //         for (const keyCode of keyCodes) {
        //             this.fireKeyUp(keyCode);
        //         }
        //     },
        //     preventMouseDownDefault: true,
        //     preventMouseUpDefault: true,
        //     stopMouseDownPropagation: true,
        //     stopMouseUpPropagation: true,
        //     physicalKeyboardHighlight: false,
        //     physicalKeyboardHighlightPress: false,
        //     physicalKeyboardHighlightPressUseClick: false,
        //     physicalKeyboardHighlightPressUsePointerEvents: false,
        // });

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

function createMouseOverlayLayer() {
    return createDiv("emulator-mouse-overlay", "");
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
