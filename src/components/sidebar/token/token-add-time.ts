import { useState } from "preact/hooks";
import { addFreeTimeTierEndpoint } from "../../../backend/v7/v7-config";
import { html } from "../../../dom";
import { Icons } from "../../../icons";
import { request } from "../../../request";
import { TokenProps } from "./token";

export function TokenAddTime(props: TokenProps) {
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<boolean>(false);
    const [time, setTime] = useState<number>(1800);

    function onChange(e: any) {
        setTime(Number.parseInt(e.currentTarget.value));
    }

    async function onAddTime() {
        if (busy) {
            return;
        }

        setError(null);
        setBusy(true);

        try {
            if (time === 1800) {
                await request(addFreeTimeTierEndpoint, "POST", JSON.stringify({
                    token: props.networkToken,
                }));

                props.update();
            }
        } catch (e: any) {
            setError(describe(e.message));
        } finally {
            setBusy(false);
        }
    }

    /* eslint-disable new-cap */
    return html`
        <div class="font-bold">Add time:</div>
        <div class="flex flex-row">
            <select class="w-14 flex-grow mr-2" name="select" onChange=${onChange}>
                <option value="1800" selected>FREE</option>
                <option value="432000">+5 Days</option>
                <option value="2592000">+30 Days</option>
            </select>
            ${ busy ? Icons.Refresh({ class: "h-6 w-6 animate-spin" }) : html`
                <div class="h-6 w-6 cursor-pointer text-green-400 hover:text-green-600"
                    onClick=${onAddTime}>
                    <${Icons.Plus} class="h-6 w-6" />
                </div>
            `}
        </div>
        
        ${error ?
        html`
            <div class="font-bold text-red-400 col-span-2">*${error}</div>
        ` : null}
      
    `;
    /* eslint-enable new-cap */
}

function describe(message: string) {
    if (message === "30-min-required") {
        return "Only 30 minutes interval are enabled";
    }
    if (message === "free-soft-limit") {
        return "This token reached free time limit, please use paid time";
    }
    if (message === "free-hard-limit") {
        return "All free time of today is used, please use paid time";
    }

    return message;
}
