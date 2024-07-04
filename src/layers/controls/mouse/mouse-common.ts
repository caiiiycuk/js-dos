import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";
import { pointer, getPointerState } from "../../dom/pointer";
import { mouseSwipe } from "./mouse-swipe";
import { mouseNotLocked } from "./mouse-not-locked";
import { mouseLocked } from "./mouse-locked";

const insensitivePadding = 1 / 100;

export function mapXY(eX: number, eY: number,
                      ci: CommandInterface, layers: Layers) {
    const frameWidth = ci.width();
    const frameHeight = ci.height();
    const containerWidth = layers.width;
    const containerHeight = layers.height;

    const aspect = frameWidth / frameHeight;

    let width = containerWidth;
    let height = containerWidth / aspect;

    if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * aspect;
    }

    const top = (containerHeight - height) / 2;
    const left = (containerWidth - width) / 2;

    let x = Math.max(0, Math.min(1, (eX - left) / width));
    let y = Math.max(0, Math.min(1, (eY - top) / height));

    if (x <= insensitivePadding) {
        x = 0;
    }

    if (x >= (1 - insensitivePadding)) {
        x = 1;
    }

    if (y <= insensitivePadding) {
        y = 0;
    }

    if (y >= (1 - insensitivePadding)) {
        y = 1;
    }

    return {
        x,
        y,
    };
}

export function mount(el: HTMLDivElement, layers: Layers,
                      onMouseDown: (x: number, y: number, button: number) => void,
                      onMouseMove: (x: number, y: number, mX: number, mY: number) => void,
                      onMouseUp: (x: number, y: number, button: number) => void,
                      onMouseLeave: (x: number, y: number) => void) {
    // eslint-disable-next-line
    function preventDefaultIfNeeded(e: Event) {
        // not needed yet
    }

    let pressedButton = 0;
    const onStart = (e: Event) => {
        if (e.target !== el) {
            return;
        }

        if (layers.pointerDisabled) {
            e.stopPropagation();
            preventDefaultIfNeeded(e);
            return;
        }

        const state = getPointerState(e, el);
        pressedButton = state.button || layers.pointerButton;
        onMouseDown(state.x, state.y, pressedButton);

        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onChange = (e: Event) => {
        if (e.target !== el) {
            return;
        }

        if (layers.pointerDisabled) {
            e.stopPropagation();
            preventDefaultIfNeeded(e);
            return;
        }

        const state = getPointerState(e, el);
        onMouseMove(state.x, state.y, state.mX, state.mY);
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onEnd = (e: Event) => {
        if (layers.pointerDisabled) {
            e.stopPropagation();
            preventDefaultIfNeeded(e);
            return;
        }

        const state = getPointerState(e, el);
        onMouseUp(state.x, state.y, pressedButton);
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onLeave = (e: Event) => {
        if (e.target !== el) {
            return;
        }

        if (layers.pointerDisabled) {
            e.stopPropagation();
            preventDefaultIfNeeded(e);
            return;
        }

        const state = getPointerState(e, el);
        onMouseLeave(state.x, state.y);
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onPrevent = (e: Event) => {
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const options = {
        capture: false,
    };

    for (const next of pointer.starters) {
        el.addEventListener(next, onStart, options);
    }
    for (const next of pointer.changers) {
        el.addEventListener(next, onChange, options);
    }
    for (const next of pointer.enders) {
        el.addEventListener(next, onEnd, options);
    }
    for (const next of pointer.prevents) {
        el.addEventListener(next, onPrevent, options);
    }
    for (const next of pointer.leavers) {
        el.addEventListener(next, onLeave, options);
    }

    return () => {
        for (const next of pointer.starters) {
            el.removeEventListener(next, onStart, options);
        }
        for (const next of pointer.changers) {
            el.removeEventListener(next, onChange, options);
        }
        for (const next of pointer.enders) {
            el.removeEventListener(next, onEnd, options);
        }
        for (const next of pointer.prevents) {
            el.removeEventListener(next, onPrevent, options);
        }
        for (const next of pointer.leavers) {
            el.removeEventListener(next, onLeave, options);
        }
    };
}

export function mouse(autolock: boolean, sensitivity: number, layers: Layers, ci: CommandInterface) {
    if (autolock && !pointer.canLock) {
        return mouseSwipe(sensitivity, layers, ci);
    }

    if (autolock) {
        return mouseLocked(sensitivity, layers, ci);
    }

    return mouseNotLocked(layers, ci);
}
