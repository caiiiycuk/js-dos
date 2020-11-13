import { Notyf } from "notyf";
export interface ControlSelector {
    select: () => HTMLSelectElement;
    input: () => HTMLInputElement;
    send: () => HTMLElement;
    save: () => HTMLElement;
    fullscreen: () => HTMLElement;
}
export declare function layers(root: HTMLDivElement, controlSelector?: ControlSelector): Layers;
export declare class Layers {
    root: HTMLDivElement;
    loading: HTMLDivElement;
    canvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    mouseOverlay: HTMLDivElement;
    controls: HTMLDivElement | null;
    controlSelector: ControlSelector;
    width: number;
    height: number;
    notyf: Notyf;
    private clickToStart;
    private loaderText;
    private onResize;
    private onKeyDown;
    private onKeyUp;
    private onKeyPress;
    private onSave;
    private controlsOpened;
    private selectParentElement;
    private selectParentDisplay;
    constructor(root: HTMLDivElement, controlSelector?: ControlSelector);
    setOnResize(handler: (width: number, height: number) => void): void;
    setOnKeyDown(handler: (keyCode: number) => void): void;
    fireKeyDown(keyCode: number): void;
    setOnKeyUp(handler: (keyCode: number) => void): void;
    fireKeyUp(keyCode: number): void;
    setOnKeyPress(handler: (keyCode: number) => void): void;
    fireKeyPress(keyCode: number): void;
    setOnSave(handler: () => Promise<void>): void;
    hideLoadingLayer(): void;
    showLoadingLayer(): void;
    setLoadingMessage(message: string): void;
    switchToVideo(): void;
    showClickToStart(): void;
    setControlLayers(layers: string[], onChange: (layer: string) => void): void;
}
