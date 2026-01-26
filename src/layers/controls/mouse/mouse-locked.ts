import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";
import { mount } from "./mouse-common";

export function mouseLocked(sensitivity: number, layers: Layers, ci: CommandInterface) {
    const el = layers.mouseOverlay;

    function isNotLocked() {
        return document.pointerLockElement !== el;
    }

    async function onMouseDown(x: number, y: number, button: number) {
        if (isNotLocked()) {
            try {
                await (el as any).requestPointerLock({ unadjustedMovement: true });
            } catch (error) {
                console.warn("Failed to request pointer lock with unadjusted movement, falling back to default");
                await el.requestPointerLock();
            }
            return;
        }

        ci.sendMouseButton(button, true);
    }

    function onMouseUp(x: number, y: number, button: number) {
        if (isNotLocked()) {
            return;
        }

        ci.sendMouseButton(button, false);
    }

    function onMouseMove(x: number, y: number, mX: number, mY: number) {
        if (isNotLocked()) {
            return;
        }

        if (mX === 0 && mY === 0) {
            return;
        }

        (ci as any).sendMouseRelativeMotion(mX, mY);
    }

    function onMouseLeave(x: number, y: number) {
        // nothing to do
    }

    return mount(el, layers, sensitivity, true, onMouseDown, onMouseMove, onMouseUp, onMouseLeave);
}
