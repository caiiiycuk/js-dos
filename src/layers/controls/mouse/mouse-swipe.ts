import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";

import { mount } from "./mouse-common";

const clickDelay = 500;
const clickThreshold = 50;

export function mouseSwipe(sensitivity: number, layers: Layers, ci: CommandInterface) {
    const el = layers.mouseOverlay;

    let startedAt = -1;
    let acc = 0;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (x: number, y: number) => {
        startedAt = Date.now();
        acc = 0;
        prevX = x;
        prevY = y;
    };

    function onMouseMove(x: number, y: number, mX: number, mY: number) {
        if (mX === undefined) {
            mX = x - prevX;
        }

        if (mY === undefined) {
            mY = y - prevY;
        }

        prevX = x;
        prevY = y;

        if (mX === 0 && mY === 0) {
            return;
        }

        acc += Math.abs(mX) + Math.abs(mY);

        (ci as any).sendMouseRelativeMotion(mX * sensitivity * 2, mY * sensitivity * 2);
    }

    const onMouseUp = (x: number, y: number) => {
        const delay = Date.now() - startedAt;

        if (delay < clickDelay && acc < clickThreshold) {
            const button = layers.pointerButton || 0;
            ci.sendMouseButton(button, true);
            setTimeout(() => ci.sendMouseButton(button, false), 60);
        }
    };

    const noop = () => {};

    return mount(el, layers, onMouseDown, onMouseMove, onMouseUp, noop);
}
