import { CommandInterface } from "emulators";
import { mousePointerLock } from "./mouse/mouse-locked";
import { mouseDefault } from "./mouse/mouse-not-locked";
import { mouseSwipe } from "./mouse/mouse-swipe";
import { pointer } from "./mouse/pointer";

export function mouse(lock: boolean,
                      sensitivity: number,
                      pointerButton: number,
                      el: HTMLElement,
                      ci: CommandInterface) {
    if (lock && !pointer.canLock) {
        return mouseSwipe(sensitivity, pointerButton, el, ci);
    }

    if (lock) {
        const unlock = mousePointerLock(el);
        const umount = mouseSwipe(sensitivity, pointerButton, el, ci);

        return () => {
            umount();
            unlock();
        };
    }

    return mouseDefault(pointerButton, el, ci);
}
