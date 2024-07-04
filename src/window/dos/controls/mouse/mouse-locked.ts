import { pointer } from "./pointer";

export function mousePointerLock(el: HTMLElement) {
    function requestLock() {
        if (document.pointerLockElement !== el) {
            const requestPointerLock = el.requestPointerLock ||
                (el as any).mozRequestPointerLock ||
                (el as any).webkitRequestPointerLock;

            requestPointerLock.call(el);

            return;
        }
    }

    const options = {
        capture: true,
    };

    for (const next of pointer.starters) {
        el.addEventListener(next, requestLock, options);
    }

    return () => {
        for (const next of pointer.starters) {
            el.removeEventListener(next, requestLock, options);
        }
    };
}
