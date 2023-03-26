import { CommandInterface } from "emulators";
import { domToKeyCode } from "./keys";

export function keyboard(el: HTMLElement, ci: CommandInterface) {
    function onKeyDown(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        const keyCode = domToKeyCode(e.keyCode);
        ci.sendKeyEvent(keyCode, true);
        e.stopPropagation();
        e.preventDefault();
    };

    function onKeyUp(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        const keyCode = domToKeyCode(e.keyCode);
        ci.sendKeyEvent(keyCode, false);
        e.stopPropagation();
        e.preventDefault();
    };

    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);

    return () => {
        el.removeEventListener("keydown", onKeyDown);
        el.removeEventListener("keyup", onKeyUp);
    };
}
