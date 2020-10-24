import { Notyf } from "notyf";
export interface ControlSelector {
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
    private onSave;
    private controlsOpened;
    constructor(root: HTMLDivElement, controlSelector?: ControlSelector);
    setOnResize(handler: (width: number, height: number) => void): void;
    setOnKeyDown(handler: (keyCode: number) => void): void;
    setOnKeyUp(handler: (keyCode: number) => void): void;
    setOnSave(handler: () => Promise<void>): void;
    hideLoadingLayer(): void;
    showLoadingLayer(): void;
    setLoadingMessage(message: string): void;
    switchToVideo(): void;
    showClickToStart(): void;
}
