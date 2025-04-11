import { CommandInterface } from "emulators";
import { domToKeyCode } from "./keys";

type Mapper = { [key: number]: number };

// Static map, future have customizable.
const keyMap: Mapper = {
    87: 38,  // W → ArrowUp
    65: 37,  // A → ArrowLeft
    83: 40,  // S → ArrowDown
    68: 39,  // D → ArrowRight
    81: 103, // Q → Numpad7
    69: 105  // E → Numpad9
};

export function keyboard(el: HTMLElement, ci: CommandInterface, keymap: boolean = false, mapper: Mapper = keyMap) {
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
