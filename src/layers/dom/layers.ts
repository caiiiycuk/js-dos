import { createDiv } from "./helpers";

// eslint-disable-next-line
export interface LayersOptions {
    optionControls?: string[];
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

    toggleKeyboard: () => void;

    private onResize: ((width: number, height: number) => void)[];

    private onKeyDown: (keyCode: number) => void;
    private onKeyUp: (keyCode: number) => void;
    private onKeyPress: (keyCode: number) => void;
    private onKeysPress: (keyCodes: number[]) => void;

    // eslint-disable-next-line
    constructor(root: HTMLDivElement, canvas: HTMLCanvasElement, toggleKeyboard: () => void, options: LayersOptions) {
        this.toggleKeyboard = toggleKeyboard;
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
}

function createMouseOverlayLayer() {
    return createDiv("emulator-mouse-overlay", "");
}
