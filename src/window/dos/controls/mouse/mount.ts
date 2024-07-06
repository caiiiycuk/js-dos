import { pointer, getPointerState } from "./pointer";

export function mount(el: HTMLElement,
                      onMouseDown: (x: number, y: number, button?: number) => void,
                      onMouseMove: (x: number, y: number, mX: number, mY: number) => void,
                      onMouseUp: (x: number, y: number, button?: number) => void,
                      onMouseLeave: (x: number, y: number) => void) {
    // eslint-disable-next-line
    function preventDefaultIfNeeded(e: Event) {
        // not needed yet
    }

    const onStart = (e: Event) => {
        if (e.target !== el) {
            return;
        }

        const state = getPointerState(e, el);
        onMouseDown(state.x, state.y, state.button);

        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onChange = (e: Event) => {
        if (e.target !== el) {
            return;
        }

        const state = getPointerState(e, el);
        onMouseMove(state.x, state.y, state.mX, state.mY);
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onEnd = (e: Event) => {
        const state = getPointerState(e, el);
        onMouseUp(state.x, state.y, state.button);
        e.stopPropagation();
        preventDefaultIfNeeded(e);
    };

    const onLeave = (e: Event) => {
        if (e.target !== el) {
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
