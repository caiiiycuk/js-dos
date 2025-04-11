import { CommandInterface } from "emulators";
import { domToKeyCode, KBD_up, KBD_left, KBD_down, KBD_right, KBD_kp7, KBD_kp9 } from "./keys";

type Mapper = { [key: number]: number };

// Static map, future have customizable?  Stored somewhere else?
const keyMapWASD: Mapper = {
    87: KBD_up,      // W → ArrowUp
    65: KBD_left,    // A → ArrowLeft
    83: KBD_down,    // S → ArrowDown
    68: KBD_right,   // D → ArrowRight
    81: KBD_kp7,     // Q → Numpad7
    69: KBD_kp9      // E → Numpad9
};

export function keyboard(el: HTMLElement, ci: CommandInterface, keymap: boolean = false, mapper: Mapper = keyMapWASD) {

    function onKeyDown(e: KeyboardEvent) {
        if ((e.target as any).type === "text") {
            return;
        }
        let keyCode = domToKeyCode(e.keyCode, e.location);
        if (keymap && mapper[keyCode] !== undefined) {
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
        if (keymap && mapper[keyCode] !== undefined) {
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
