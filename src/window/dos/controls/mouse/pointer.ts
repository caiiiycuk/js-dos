const MAX_MOVEMENT_REAL_SPEED = 50;

function initBind() {
    const isMobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.appVersion) ||
        /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(navigator.userAgent) ||
        (/MacIntel/.test(navigator.platform) && navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
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
    id: string,
    x: number,
    y: number,
    mX: number,
    mY: number,
    button?: number,
}

const pointerPositions: {[id: string]: {x: number, y: number}} = {};
export function getPointerState(e: Event, el: HTMLElement, sensitivity: number, locked: boolean): PointerState {
    function getState(e: Event): PointerState {
        if (e.type.match(/^touch/)) {
            const evt = e as TouchEvent;
            const rect = el.getBoundingClientRect();
            return {
                id: "touch-" + evt.targetTouches[0].identifier,
                x: evt.targetTouches[0].clientX - rect.x,
                y: evt.targetTouches[0].clientY - rect.y,
                mX: 0,
                mY: 0,
            };
        } else if (e.type.match(/^pointer/)) {
            const evt = e as PointerEvent;
            return {
                id: "pointer-" + evt.pointerId,
                x: evt.offsetX,
                y: evt.offsetY,
                mX: evt.movementX,
                mY: evt.movementY,
                button: evt.button > 0 ? 1 : undefined,
            };
        } else {
            const evt = e as MouseEvent;
            return {
                id: "mouse",
                x: evt.offsetX,
                y: evt.offsetY,
                mX: evt.movementX,
                mY: evt.movementY,
                button: evt.button === 0 ? 0 : 1,
            };
        }
    }


    const state = getState(e);
    if (!locked) {
        if (pointerPositions[state.id]) {
            state.mX = state.x - pointerPositions[state.id].x;
            state.mY = state.y - pointerPositions[state.id].y;
        } else {
            state.mX = 0;
            state.mY = 0;
        }
    }

    pointerPositions[state.id] = { x: state.x, y: state.y };
    state.mX = calibrateMovement(state.mX, sensitivity);
    state.mY = calibrateMovement(state.mY, sensitivity);
    return state;
}

export const pointer = initBind();

function calibrateMovement(value: number, sensitivity: number) {
    if (value > MAX_MOVEMENT_REAL_SPEED) {
        value = MAX_MOVEMENT_REAL_SPEED;
    } else if (value < -MAX_MOVEMENT_REAL_SPEED) {
        value = -MAX_MOVEMENT_REAL_SPEED;
    }

    // Map sensitivity (0-1) to logarithmic scale (0.01-5)
    // Scale will be 1 when sensitivity = 0.5
    const scale = Math.pow(8, sensitivity * 2 - 1);
    value = value * scale;

    return value;
}

