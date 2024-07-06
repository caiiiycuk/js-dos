import { CommandInterface } from "emulators";
import { mount } from "./mount";

const insensitivePadding = 1 / 100;

export function mouseDefault(pointerButton: number,
                             el: HTMLElement,
                             ci: CommandInterface) {
    const mapXY = (x: number, y: number) => doMapXY(x, y, el, ci);

    if (document.pointerLockElement === el) {
        document.exitPointerLock();
    }

    function onMouseDown(x: number, y: number, button?: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
        ci.sendMouseButton(button ?? pointerButton, true);
    }

    function onMouseUp(x: number, y: number, button?: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
        ci.sendMouseButton(button ?? pointerButton, false);
    }

    function onMouseMove(x: number, y: number, mX: number, mY: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
    }

    function onMouseLeave(x: number, y: number) {
        const xy = mapXY(x, y);
        ci.sendMouseMotion(xy.x, xy.y);
    }

    return mount(el, onMouseDown, onMouseMove, onMouseUp, onMouseLeave);
}

function doMapXY(eX: number,
                 eY: number,
                 el: HTMLElement,
                 ci: CommandInterface) {
    const { width: containerWidth, height: containerHeight } = el.getBoundingClientRect();
    const frameWidth = ci.width();
    const frameHeight = ci.height();

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
