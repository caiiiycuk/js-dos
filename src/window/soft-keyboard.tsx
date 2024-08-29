import { CommandInterface } from "emulators";
import { State } from "../store";
import { useDispatch, useSelector } from "react-redux";
/* eslint-disable camelcase */
import { domToKeyCode, KBD_backspace, KBD_capslock, KBD_comma, KBD_down, KBD_enter,
    KBD_esc, KBD_left, KBD_leftalt, KBD_leftbracket, KBD_leftctrl, KBD_leftshift,
    KBD_period, KBD_quote, KBD_right, KBD_rightbracket, KBD_semicolon, KBD_space,
    KBD_tab, KBD_up } from "./dos/controls/keys";
import { dosSlice } from "../store/dos";
/* eslint-enable camelcase */

export function SoftKeyboard(props: { ci: CommandInterface | null }) {
    const { ci } = props;
    const visible = useSelector((state: State) => state.dos.softKeyboard);
    const layout = useSelector((state: State) => state.dos.softKeyboardLayout);
    const symbols = useSelector((state: State) => state.dos.softKeyboardSymbols);
    const activeSymbols = useSelector((state: State) => state.dos.softKeyboardActiveSymbols);
    const dispatch = useDispatch();
    const display = symbols[activeSymbols] ?? {};

    if (!visible || ci === null) {
        return null;
    }


    function onChange(key: string, pressed: boolean) {
        if (ci !== null) {
            if (key === "⎘") {
                if (pressed) {
                    const next = (activeSymbols + 1) % symbols.length;
                    if (next !== activeSymbols) {
                        dispatch(dosSlice.actions.softKeyboardActiveSymbols(next));
                    }
                }
            } else {
                for (const next of buttonToCode(key)) {
                    ci.sendKeyEvent(next, pressed);
                }
            }
        }
    };

    return <div class="soft-keyboard flex flex-col gap-3 my-2 mx-2 items-center">
        { layout.map((keys) => {
            return <div class="flex flex-row gap-2 flex-wrap">
                {keys.split(" ").map((key) => {
                    return <kbd class="kbd kbd-md cursor-pointer hover:bg-slate-400"
                        onPointerDown={() => onChange(key, true)}
                        onPointerUp={() => onChange(key, false)}
                        onPointerCancel={() => onChange(key, false)}
                    >{ display[key] ?? key }</kbd>;
                })}
            </div>;
        })}
    </div>;
}


/* eslint-disable camelcase */
function buttonToCode(button: string): number[] {
    if (button.length > 1) {
        if (button === "{enter}") {
            return [KBD_enter];
        } else if (button === "{shift}") {
            return [KBD_leftshift];
        } else if (button === "{bksp}") {
            return [KBD_backspace];
        } else if (button === "{lock}") {
            return [KBD_capslock];
        } else if (button === "{tab}") {
            return [KBD_tab];
        } else if (button === "{space}") {
            return [KBD_space];
        } else if (button === "{esc}") {
            return [KBD_esc];
        } else if (button === "{ctrl}") {
            return [KBD_leftctrl];
        } else if (button === "{alt}") {
            return [KBD_leftalt];
        } else if (button === "{up}") {
            return [KBD_up];
        } else if (button === "{down}") {
            return [KBD_down];
        } else if (button === "{left}") {
            return [KBD_left];
        } else if (button === "{right}") {
            return [KBD_right];
        } else {
            console.warn("Unknown button", button);
            return [];
        }
    } else if (button === ",") {
        return [KBD_comma];
    } else if (button === ".") {
        return [KBD_period];
    } else if (button === "'") {
        return [KBD_quote];
    } else if (button === ":") {
        return [KBD_leftshift, KBD_semicolon];
    } else if (button === "{") {
        return [KBD_leftshift, KBD_leftbracket];
    } else if (button === "}") {
        return [KBD_leftshift, KBD_rightbracket];
    }

    const keyCode = domToKeyCode(button.toUpperCase().charCodeAt(0));
    if (keyCode === 0) {
        return [];
    }

    return [keyCode];
}

/* eslint-enable camelcase */
