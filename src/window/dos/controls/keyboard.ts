import { CommandInterface } from "emulators";
import { domToKeyCode } from "./keys";

type Mapper = { [key: number]: number };

export function keyboard(el: HTMLElement, ci: CommandInterface, keymap: boolean = false, mapper?: Mapper) {
    function onKeyDown(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        let keyCode = domToKeyCode(e.keyCode, e.location);
        if (keymap && mapper && mapper[keyCode] !== undefined) {
            keyCode = mapper[keyCode];
        }
        ci.sendKeyEvent(keyCode, true);
        e.stopPropagation();
        e.preventDefault();
    }

    function onKeyUp(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        let keyCode = domToKeyCode(e.keyCode, e.location);
        if (keymap && mapper && mapper[keyCode] !== undefined) {
            keyCode = mapper[keyCode];
        }
        ci.sendKeyEvent(keyCode, false);
        e.stopPropagation();
        e.preventDefault();
    }

    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("keyup", onKeyUp);

    return () => {
        el.removeEventListener("keydown", onKeyDown);
        el.removeEventListener("keyup", onKeyUp);
    };
}
