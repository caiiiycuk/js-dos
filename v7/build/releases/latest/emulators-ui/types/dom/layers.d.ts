import { Notyf } from "notyf";
export interface LayersOptions {
    scale: number;
}
export declare function layers(root: HTMLDivElement, options?: LayersOptions): Layers;
export declare class Layers {
    root: HTMLDivElement;
    loading: HTMLDivElement;
    canvas: HTMLCanvasElement;
    video: HTMLVideoElement;
    mouseOverlay: HTMLDivElement;
    width: number;
    height: number;
    notyf: Notyf;
    toggleKeyboard: () => boolean;
    private clickToStart;
    private loaderText;
    private onResize;
    private onKeyDown;
    private onKeyUp;
    private onKeyPress;
    private onSave;
    private fullscreen;
    private onFullscreenChanged;
    private scale;
    constructor(root: HTMLDivElement, options: LayersOptions);
    private initKeyEvents;
    preventContextMenu(): void;
    setOnResize(handler: (width: number, height: number) => void): void;
    setOnKeyDown(handler: (keyCode: number) => void): void;
    fireKeyDown(keyCode: number): void;
    setOnKeyUp(handler: (keyCode: number) => void): void;
    fireKeyUp(keyCode: number): void;
    setOnKeyPress(handler: (keyCode: number) => void): void;
    fireKeyPress(keyCode: number): void;
    toggleFullscreen(): void;
    setOnFullscreen(onFullscreenChanged: (fullscreen: boolean) => void): void;
    save(): Promise<void>;
    setOnSave(handler: () => Promise<void>): void;
    hideLoadingLayer(): void;
    showLoadingLayer(): void;
    setLoadingMessage(message: string): void;
    switchToVideo(): void;
    showClickToStart(): void;
    getScale(): number;
}
