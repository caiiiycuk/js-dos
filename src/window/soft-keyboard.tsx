import { CommandInterface } from "emulators";
import { State } from "../store";
import { useDispatch, useSelector } from "react-redux";
/* eslint-disable camelcase */
import { domToKeyCode, KBD_0, KBD_9, KBD_backspace, KBD_capslock, KBD_comma, KBD_down, KBD_enter,
    KBD_esc,
    KBD_f1, KBD_f2, KBD_f3,
    KBD_f4, KBD_f5, KBD_f6,
    KBD_f7, KBD_f8, KBD_f9,
    KBD_f10, KBD_f11, KBD_f12,
    KBD_left, KBD_leftalt, KBD_leftbracket, KBD_leftctrl, KBD_leftshift,
    KBD_period, KBD_quote, KBD_right, KBD_rightbracket, KBD_semicolon, KBD_space,
    KBD_tab, KBD_up,
    KBD_kp0,
    KBD_kp2,
    KBD_kp1,
    KBD_kp3,
    KBD_kp4,
    KBD_kp5,
    KBD_kp6,
    KBD_kp7,
    KBD_kp8,
    KBD_kp9,
    KBD_pagedown,
    KBD_pageup,
    KBD_delete,
    KBD_end,
    KBD_home,
    KBD_minus,
    KBD_equals } from "./dos/controls/keys";
import { dosSlice } from "../store/dos";
/* eslint-enable camelcase */

export function SoftKeyboard(props: { ci: CommandInterface | null }) {
    const { ci } = props;
    const visible = useSelector((state: State) => state.dos.softKeyboard);
    const layout = useSelector((state: State) => state.dos.softKeyboardLayout);
    const symbols = useSelector((state: State) => state.dos.softKeyboardSymbols);
    const activeSymbols = useSelector((state: State) => state.dos.softKeyboardActiveSymbols);
    const activeLayout = useSelector((state: State) => state.dos.softKeyboardActiveLayout);
    const dispatch = useDispatch();
    const display = symbols[activeSymbols % symbols.length];
    const keyboard = layout[activeLayout % layout.length];

    if (!visible || ci === null) {
        return null;
    }


    function onChange(key: string, pressed: boolean) {
        if (ci !== null) {
            if (key === "{symbols}") {
                if (pressed) {
                    const next = (activeSymbols + 1) % symbols.length;
                    if (next !== activeSymbols) {
                        dispatch(dosSlice.actions.softKeyboardActiveSymbols(next));
                    }
                }
            } else if (key === "{layout}") {
                if (pressed) {
                    const next = (activeLayout + 1) % layout.length;
                    if (next !== activeLayout) {
                        dispatch(dosSlice.actions.softKeyboardActiveLayout(next));
                    }
                }
            } else {
                for (const next of buttonToCode(key)) {
                    ci.sendKeyEvent(next, pressed);
                }
            }
        }
    }

    function short(key: string) {
        if (key.length > 2 && key.startsWith("{") && key.endsWith("}")) {
            return key[1].toUpperCase() + key.substring(2, key.length - 1);
        }
        return key;
    }

    return <div class="soft-keyboard my-4 mx-2">
        <div class="flex flex-row gap-2 flex-wrap justify-evenly items-center">
            {keyboard.map((layout, i) => {
                return <div class={ "flex flex-col gap-2 flex-wrap" +
                        ((keyboard.length === 1 || i === 1) ? " items-center" :
                            ( i === 0 ? " items-start" : " items-end" ))
                }>
                    {layout.map((keys) => {
                        return <div class="flex flex-row gap-2 flex-wrap items-center">
                            {keys.length === 0 ? <div class="kbd-md" /> : keys.split(" ").map((key) => {
                                return <kbd class="kbd kbd-md cursor-pointer hover:bg-accent-focus"
                                    onPointerDown={() => onChange(key, true)}
                                    onPointerUp={() => onChange(key, false)}
                                    onPointerCancel={() => onChange(key, false)}
                                >{ display[key] ?? symbols[0][key] ?? short(key) }</kbd>;
                            })}
                        </div>;
                    })}
                </div>;
            })}
        </div>
    </div>;
}


/* eslint-disable camelcase */
function buttonToCode(button: string): number[] {
    switch (button) {
        case "{enter}":
            return [KBD_enter];
        case "{shift}":
            return [KBD_leftshift];
        case "{bksp}":
            return [KBD_backspace];
        case "{lock}":
            return [KBD_capslock];
        case "{tab}":
            return [KBD_tab];
        case "{space}":
            return [KBD_space];
        case "{esc}":
            return [KBD_esc];
        case "{ctrl}":
            return [KBD_leftctrl];
        case "{alt}":
            return [KBD_leftalt];
        case "{up}":
            return [KBD_up];
        case "{down}":
            return [KBD_down];
        case "{left}":
            return [KBD_left];
        case "{right}":
            return [KBD_right];
        case ",":
            return [KBD_comma];
        case ".":
            return [KBD_period];
        case "'":
            return [KBD_quote];
        case ":":
            return [KBD_leftshift, KBD_semicolon];
        case "{":
            return [KBD_leftshift, KBD_leftbracket];
        case "}":
            return [KBD_leftshift, KBD_rightbracket];
        case "(":
            return [KBD_leftshift, KBD_9];
        case ")":
            return [KBD_leftshift, KBD_0];
        case "{f1}":
            return [KBD_f1];
        case "{f2}":
            return [KBD_f2];
        case "{f3}":
            return [KBD_f3];
        case "{f4}":
            return [KBD_f4];
        case "{f5}":
            return [KBD_f5];
        case "{f6}":
            return [KBD_f6];
        case "{f7}":
            return [KBD_f7];
        case "{f8}":
            return [KBD_f8];
        case "{f9}":
            return [KBD_f9];
        case "{f10}":
            return [KBD_f10];
        case "{f11}":
            return [KBD_f11];
        case "{f12}":
            return [KBD_f12];
        case "{kp1}":
            return [KBD_kp1];
        case "{kp2}":
            return [KBD_kp2];
        case "{kp3}":
            return [KBD_kp3];
        case "{kp4}":
            return [KBD_kp4];
        case "{kp5}":
            return [KBD_kp5];
        case "{kp6}":
            return [KBD_kp6];
        case "{kp7}":
            return [KBD_kp7];
        case "{kp8}":
            return [KBD_kp8];
        case "{kp9}":
            return [KBD_kp9];
        case "{kp0}":
            return [KBD_kp0];
        case "{pgup}":
            return [KBD_pageup];
        case "{pgdown}":
            return [KBD_pagedown];
        case "{del}":
            return [KBD_delete];
        case "{home}":
            return [KBD_home];
        case "{end}":
            return [KBD_end];
        case "-":
            return [KBD_minus];
        case "=":
            return [KBD_equals];
        case "+":
            return [KBD_leftshift, KBD_equals];
        default: {
            if (button.length > 1) {
                console.warn("Unknown button", button);
                return [];
            }
        }
    }

    const keyCode = domToKeyCode(button.toUpperCase().charCodeAt(0));
    if (keyCode === 0) {
        return [];
    }

    return [keyCode];
}

/* eslint-enable camelcase */
