import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";

import { mapXY as doMapXY, mount } from "./mouse-common";

export function mouseNotLocked(layers: Layers, ci: CommandInterface) {
    const el = layers.mouseOverlay;
    const mapXY = (x: number, y: number) => doMapXY(x, y, ci, layers);

    if (document.pointerLockElement === el) {
        document.exitPointerLock();
    }

    function onMouseDown(x: number, y: number, button: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
        ci.sendMouseButton(button, true);
    }

    function onMouseUp(x: number, y: number, button: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
        ci.sendMouseButton(button, false);
    }

    function onMouseMove(x: number, y: number, mX: number, mY: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
    }

    function onMouseLeave(x: number, y: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
    }

    return mount(el, layers, onMouseDown, onMouseMove, onMouseUp, onMouseLeave);
}
