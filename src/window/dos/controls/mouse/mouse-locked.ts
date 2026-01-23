import { pointer } from "./pointer";

export function mousePointerLock(el: HTMLElement) {
    async function requestLock() {
        if (document.pointerLockElement !== el) {
            try {
                await el.requestPointerLock({ unadjustedMovement: true });
            } catch (error) {
                console.warn("Failed to request pointer lock with unadjusted movement, falling back to default");
                await el.requestPointerLock();
            }

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
