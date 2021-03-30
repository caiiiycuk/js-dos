export declare const pointer: {
    starters: string[];
    changers: string[];
    enders: string[];
    prevents: string[];
    leavers: string[];
};
export interface PointerState {
    x: number;
    y: number;
    button?: number;
}
export declare function getPointerState(e: Event, el: HTMLElement): PointerState;
