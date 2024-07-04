export const pointer = initBind();

function initBind() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isTouch = isMobile && !!("ontouchstart" in window);
    const isPointer = isMobile && (window.PointerEvent ? true : false);
    const isMSPointer = isMobile && ((window as any).MSPointerEvent ? true : false);
    let canLock = !isMobile;

    const starters: string[] = [];
    const changers: string[] = [];
    const enders: string[] = [];
    const leavers: string[] = [];
    const prevents: string[] = [];

    if (isPointer) {
        starters.push("pointerdown");
        enders.push("pointerup", "pointercancel");
        changers.push("pointermove");
        prevents.push("touchstart", "touchmove", "touchend");
    } else if (isMSPointer) {
        starters.push("MSPointerDown");
        changers.push("MSPointerMove");
        enders.push("MSPointerUp");
    } else if (isTouch) {
        canLock = false;
        starters.push("touchstart", "mousedown");
        changers.push("touchmove");
        enders.push("touchend", "touchcancel", "mouseup");
    } else {
        starters.push("mousedown");
        changers.push("mousemove");
        enders.push("mouseup");
        leavers.push("mouseleave");
    }

    return {
        mobile: isMobile,
        canLock,
        starters,
        changers,
        enders,
        prevents,
        leavers,
    };
}

export interface PointerState {
    x: number,
    y: number,
    mX: number,
    mY: number,
    button?: number,
}

export function getPointerState(e: Event, el: HTMLElement): PointerState {
    if (e.type.match(/^touch/)) {
        const evt = e as TouchEvent;
        const rect = el.getBoundingClientRect();
        return {
            x: evt.targetTouches[0].clientX - rect.x,
            y: evt.targetTouches[0].clientY - rect.y,
            mX: 0,
            mY: 0,
        };
    } else if (e.type.match(/^pointer/)) {
        const evt = e as PointerEvent;
        return {
            x: evt.offsetX,
            y: evt.offsetY,
            mX: evt.movementX,
            mY: evt.movementY,
        };
    } else {
        const evt = e as MouseEvent;
        return {
            x: evt.offsetX,
            y: evt.offsetY,
            mX: evt.movementX,
            mY: evt.movementY,
            button: evt.button === 0 ? 0 : 1,
        };
    }
}

export const pointers = {
    bind: pointer,
    getPointerState,
};
