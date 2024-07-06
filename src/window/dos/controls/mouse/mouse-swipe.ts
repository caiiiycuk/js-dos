import { CommandInterface } from "emulators";
import { mount } from "./mount";

const clickDelay = 500;
const clickThreshold = 50;

export function mouseSwipe(sensitivity: number,
                           pointerButton: number,
                           el: HTMLElement,
                           ci: CommandInterface) {
    let startedAt = -1;
    let acc = 0;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (x: number, y: number, mouseButton?: number) => {
        startedAt = Date.now();
        acc = 0;
        prevX = x;
        prevY = y;

        if (mouseButton !== undefined) {
            ci.sendMouseButton(mouseButton, true);
        }
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

        ci.sendMouseRelativeMotion(mX * sensitivity * 2, mY * sensitivity * 2);
    }

    const onMouseUp = (x: number, y: number, mouseButton?: number) => {
        if (mouseButton !== undefined) {
            ci.sendMouseButton(mouseButton, false);
        } else {
            const delay = Date.now() - startedAt;

            if (delay < clickDelay && acc < clickThreshold) {
                const button = mouseButton ?? pointerButton;
                ci.sendMouseButton(button, true);
                setTimeout(() => ci.sendMouseButton(button, false), 60);
            }
        }
    };

    const noop = () => {};

    return mount(el, onMouseDown, onMouseMove, onMouseUp, noop);
}
