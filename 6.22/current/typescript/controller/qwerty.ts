import { DosKeyEventConsumer } from "../js-dos-ci";
import * as DosDom from "../js-dos-dom";

export interface QwertyOptions {
    uppercase: boolean;
    cssText?: string;
}

const defaultOptions: QwertyOptions = {
    uppercase: true,
};

function convert(input: string): string {
    const controlChars: any[] = [
        { name: "Backspace", code: 8 },
        { name: "Tab",       code: 9 },
        { name: "Enter",     code: 13 },
        { name: "Shift",     code: 16 },
        { name: "Ctrl",      code: 17 },
        { name: "Alt",       code: 18 },
        { name: "Pause",     code: 19 },
        { name: "Caps",      code: 20 },
        { name: "Esc",       code: 27 },
        { name: "PgUp",      code: 33 },
        { name: "PgDn",      code: 34 },
        { name: "End",       code: 35 },
        { name: "Home",      code: 36 },
        { name: "Left",      code: 37 },
        { name: "Up",        code: 38 },
        { name: "Right",     code: 39 },
        { name: "Down",      code: 40 },
        { name: "Insert",    code: 45 },
        { name: "Delete",    code: 46 },
    ];

    let i: number = 0;
    let output: string = "";
    while (i < input.length) {
        if (input[i] === "<") {
            const index: number = controlChars.findIndex((key: any) => {
                return input.substr(i + 1, key.name.length + 1).toLowerCase()
                    === key.name.toLowerCase() + ">";
            });
            if (index !== -1) {
                output += String.fromCharCode(controlChars[index].code);
                i += controlChars[index].name.length + 2;
            } else {
                output += input[i];
                i++;
            }
        } else {
            output += input[i];
            i++;
        }
    }

    return output;
}

export default function Qwerty(zone: HTMLDivElement, consumer: DosKeyEventConsumer,
                               options: QwertyOptions = defaultOptions) {
    DosDom.applyCss("lqwerty-css", css + "\n\n" + (options.cssText || ""));

    const sendFn = () => {
        const value = options.uppercase ? input.value.toUpperCase() : input.value;
        input.value = "";
        input.blur();
        container.style.visibility = "hidden";

        if (value.length === 0) {
            return;
        }

        let i = 0;
        const convertedValue: string = convert(value);

        const id = setInterval(() => {
            if (i >= convertedValue.length * 2) {
                clearInterval(id);
                return;
            }

            if (i % 2 === 0) {
                consumer.onPress(convertedValue.charCodeAt(i / 2));
            } else {
                consumer.onRelease(convertedValue.charCodeAt((i - 1) / 2));
            }
            i++;
        }, 100);
    };

    const container = DosDom.createDiv("qwerty-container") as HTMLDivElement;
    container.innerHTML = `
        <div>ENTER CHARS:</div>

        <div class="qwerty-input-row">
            <div>:>&nbsp;</div>
            <input class="qwerty-input" value="">
            <!-- <div class="qwerty-cursor"></div> -->
            <div class="qwerty-send">Send</div>
        </div>
    `;
    container.style.visibility = "hidden";
    const noPropagationFn = (e: KeyboardEvent) => {
        e.stopPropagation();
    };
    container.addEventListener("keydown", noPropagationFn);
    container.addEventListener("keyup", noPropagationFn);
    container.addEventListener("keypress", (e: KeyboardEvent) => {
        if (e.keyCode === 13) {
            sendFn();
        }
    });
    container.addEventListener("keypress", noPropagationFn);

    const input = container.getElementsByTagName("input")[0] as HTMLInputElement;
    const resizeFn = () => {
        input.style.width = Math.max(2, input.value.length + 1) + "ch";
    };
    input.tabIndex = 1;
    input.addEventListener("input", resizeFn);
    input.addEventListener("blur", sendFn);

    const send = container.getElementsByClassName("qwerty-send")[0] as HTMLButtonElement;

    DosDom.addButtonListener(send, () => {/**/}, sendFn);

    const key = DosDom.createDiv("qwerty-key");
    DosDom.addButtonListener(key, () => {
        // nothing
    }, () => {
        if (container.style.visibility === "hidden") {
            resizeFn();
            container.style.visibility = "visible";
            input.focus();
        } else {
            container.style.visibility = "hidden";
        }
    });

    zone.appendChild(key);
    zone.appendChild(container);
}

const css = `
    .qwerty-container {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;

        display: flex;
        flex-direction: column;

        padding: 10px 20px;

        font-size: 1em;
        background: #000000e3;
        border-bottom: 2px solid white;
        font-family: monospace;
        color: white;

        line-height: 1.4em;
    }

    .qwerty-input-row {
        display: flex;
        flex-grow: 1;
        align-items: center;
    }

    .qwerty-input, .qwerty-input:focus {
        padding: 0;
        margin: 0;
        border: none;
        background: black;
        color: white;
        font: inherit;
        display: inline-block;
        outline: none;
    }

    .qwerty-send {
        color: black;
        padding: 5px 0.5em;
        margin-left: 0.5em;

        padding: 5px;
        background: lightgray;
        border-left: 1px solid white;
        border-top: 1px solid white;
        border-right: 1px solid darkgray;
        border-bottom: 1px solid darkgray;
    }

    .qwerty-key {
        display: flex;
        position: absolute;
        left: 10px;
        bottom: 10px;

        align-items: center;
        justify-content: center;
        color: black;
        font-size: 2em;

        width: 48px;
        height: 48px;
        background: lightgray url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAZRJREFUWIXtlr9KA0EQxn9ngmBroY0W/k0stZbYKFqICD6DYCFiLfgIgtG8iGIkRcBGsLGx8Q+JYAhcwDdQE8/iZsncesgpeCuYDw72+2bmZnZ3bhLooYf/Dg8YBIYc5X/2gDcg66iAtgcEjpID3Z0vAo2Uc08AFVNAA6inXEAWoM8SN4ASsKm0omg54QXhe8pnX7R54TPCi8pnS7R1u5IAmJR1SfiZZQ+AFeG7wu+VT120beGrKs6gIvxQeB4I7O6/AcrAldJOgQzQUsnKRHumKgU9CvfFp23vNg76BH4TsSdg90DqsAs4ont3AdBRtnPRDoRPK78xK/5Exb2LtpykgK+4WWdibLaWUTYvLrE2BsAUYXPl6O4GwiaqynoWGCZstBowACyI7QJ4UfEtwoYGWLIKMvF54A7Sa0IbsZ9hAZgjPA0zC3b4fDVJ0QGOZb0GjAPXwKV2SjqIfvoYJBpEPvBAdMjcEr3D70APoid5t287Oe0B54PIfIZN4DXl3P3AqPN/RB7h7/OIo/xNR3l7+EP4AJe/eBF8vW9QAAAAAElFTkSuQmCC) no-repeat center center;
        border-left: 1px solid white;
        border-top: 1px solid white;
        border-right: 1px solid darkgray;
        border-bottom: 1px solid darkgray;
    }

    .qwerty-cursor {
        background: white;
        width: 0.5em;
        height: 1em;
        animation: qwerty-blink 1s;
        -moz-animation: qwerty-blink 1s infinite;
        -webkit-animation: qwerty-blink 1s infinite;
    }

    @-moz-keyframes qwerty-blink {
        0% {background:white;}
        50% {background:black;}
        100% {background:white;}
    }

    @-webkit-keyframes qwerty-blink {
        0% {background:white;}
        50% {background:black;}
        100% {background:white;}
    }
`;
