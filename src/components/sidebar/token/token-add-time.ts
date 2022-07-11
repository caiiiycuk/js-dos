import { useState } from "preact/hooks";
import { addFreeTimeTierEndpoint, checkoutCreateTokenEndpoint, checkoutEndpoint } from "../../../backend/v7/v7-config";
import { html } from "../../../dom";
import { Icons } from "../../../icons";
import { request } from "../../../request";
import { TokenProps } from "./token";

const freeTimeSec = 1800;

export function TokenAddTime(props: TokenProps) {
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<boolean>(false);
    const [time, setTime] = useState<number>(freeTimeSec);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [needReload, setNeedReload] = useState<boolean>(false);

    async function onChange(e: any) {
        const newTime = Number.parseInt(e.currentTarget.value);
        try {
            setBusy(true);
            setAccessToken(null);
            setTime(newTime);
            if (newTime !== freeTimeSec) {
                setAccessToken(await createToken("t_" + newTime, props));
            }
        } finally {
            setBusy(false);
        }
    }

    async function onAddTime(e: any) {
        e.stopPropagation();

        if (busy) {
            return;
        }

        setError(null);
        setBusy(true);

        try {
            if (time === freeTimeSec) {
                await request(addFreeTimeTierEndpoint, "POST", JSON.stringify({
                    token: props.networkToken,
                }));

                props.update();
            } else {
                if (accessToken === null) {
                    throw new Error("accessToken is null");
                }
                purchase(accessToken, props.options().windowOpen);
                setTimeout(() => {
                    setNeedReload(true);
                }, 300);
            }
        } catch (e: any) {
            setError(describe(e.message));
        } finally {
            setBusy(false);
        }
    }

    const busyOrNoToken = busy || time !== freeTimeSec && accessToken === null;

    /* eslint-disable new-cap */
    return html`
        <div class="font-bold">Add time:</div>
        ${needReload ?
        html`
            <div class="cursor-pointer underline text-green-600 font-bold" onClick=${props.update}>
                check payment
            </div> 
        `:
        html`
            <div class="flex flex-row">
                <select disabled=${busy} class="w-14 flex-grow mr-2 
                    ${ busy ? "border-gray-400 disabled:bg-gray-200" : "" } "
                    name="select" onChange=${onChange}>
                    <option value=${freeTimeSec} selected>FREE</option>
                    <option value="259200">+3 Days</option>
                    <option value="864000">+10 Days</option>
                    <option value="2592000">+30 Days</option>
                </select>
                ${ busyOrNoToken ? Icons.Refresh({ class: "h-6 w-6 animate-reverse-spin" }) : html`
                    <div class="h-6 w-6 cursor-pointer text-green-400 hover:text-green-600"
                        onClick=${onAddTime}>
                        <${Icons.Plus} class="h-6 w-6" />
                    </div>
                `}
            </div>
        `}
        
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
    if (message === "not-found") {
        return "Token not found";
    }
    if (message === "too-early") {
        return "You can add free time only if TTL less then 5 minutes";
    }

    return message;
}

async function createToken(product: string, props: TokenProps) {
    const clientId = props.clientId ?? props.anonymousClientId;

    const token = (await request(checkoutCreateTokenEndpoint, "POST", JSON.stringify({
        id: clientId.id,
        namespace: clientId.namespace,
        product,
        token: props.networkToken,
    }))).token;

    return token;
}

function purchase(accessToken: string, windowOpen: (url: string, target?: string) => void) {
    windowOpen(checkoutEndpoint + "?token=" + accessToken, "_blank");
};
