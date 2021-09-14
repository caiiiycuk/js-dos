export declare const pointer: {
    mobile: boolean;
    canLock: boolean;
    starters: string[];
    changers: string[];
    enders: string[];
    prevents: string[];
    leavers: string[];
};
export interface PointerState {
    x: number;
    y: number;
    mX: number;
    mY: number;
    button?: number;
}
export declare function getPointerState(e: Event, el: HTMLElement): PointerState;
export declare const pointers: {
    bind: {
        mobile: boolean;
        canLock: boolean;
        starters: string[];
        changers: string[];
        enders: string[];
        prevents: string[];
        leavers: string[];
    };
    getPointerState: typeof getPointerState;
};
