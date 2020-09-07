export declare function layers(root: HTMLDivElement): Layers;
export declare class Layers {
    root: HTMLDivElement;
    loading: HTMLDivElement;
    canvas: HTMLCanvasElement;
    mouseOverlay: HTMLDivElement;
    controls: HTMLDivElement;
    width: number;
    height: number;
    private onResize;
    private onKeyDown;
    private onKeyUp;
    private onSave;
    private controlsOpened;
    private notyf;
    constructor(root: HTMLDivElement);
    setOnResize(handler: (width: number, height: number) => void): void;
    setOnKeyDown(handler: (keyCode: number) => void): void;
    setOnKeyUp(handler: (keyCode: number) => void): void;
    setOnSave(handler: () => Promise<void>): void;
    hideLoadingLayer(): void;
    showLoadingLayer(): void;
}
