import { useEffect, useState } from "preact/hooks";
import { freeTokenGet, tokenCostGet } from "../../backend/v7/v7-config";
import { html } from "../../dom";
import { Icons } from "../../icons";
import { Props } from "../../player-app";
import { getObject } from "../../xhr";

export function CreateToken(props: Props) {
    const [cost, setCost] = useState<number | null>(null);
    const [costError, setCostError] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [awaitingToken, setAwaitingToken] = useState<boolean>(false);

    useEffect(() => {
        update();
    }, [props.clientId, props.anonymousClientId]);

    async function update() {
        setCost(null);
        setCostError(null);

        const clientId = props.clientId ?? props.anonymousClientId;
        try {
            const response: {
                cost: number,
            } = await getObject(tokenCostGet +
                `?namespace=${clientId.namespace}&id=${clientId.id}&durationSec=1800`);

            setCost(response.cost);
        } catch (e: any) {
            setCostError(describe(e.message));
        }
    }

    async function tryToCreate() {
        if (awaitingToken || cost === null || props.region === null) {
            return;
        }

        setTokenError(null);
        setAwaitingToken(true);

        const clientId = props.clientId ?? props.anonymousClientId;
        try {
            const response: {
                token: string,
            } = await getObject(freeTokenGet +
                `?namespace=${clientId.namespace}&id=${clientId.id}&region=${props.region}`);

            props.setNetworkToken(response.token);
            props.setShowNewInstance(false);
            await update();
        } catch (e: any) {
            setTokenError(describe(e.message));
        }

        setAwaitingToken(false);
    }

    const canCreate = cost !== null && !awaitingToken && props.region !== null;
    const busy = awaitingToken || props.region === null;

    /* eslint-disable new-cap */
    return html`
        <div class="sidebar-header">New Instance</div>
        <div class="grid grid-cols-2 gap-4">
            <div class="font-bold">Duration:</div>
            <div class="text-gray-400">30 Min</div>
        
            <div class="font-bold">Cost:</div>
            <${CostOrError} cost=${cost} error=${costError} update=${update} />
        
            <div class="
                ${canCreate ? "bg-green-200 cursor-pointer" : "cursor-not-allowed" } 
                col-span-2 rounded uppercase text-center px-4 py-1"
                onClick=${tryToCreate}>
                ${canCreate ? "Create" : (busy ? Icons.Refresh({ class: "h-6 w-6 animate-spin" }) : "") }
            </div>

            <div class="text-red-400 text-sm col-span-2 ${tokenError === null ? "hidden" : ""} ">* ${tokenError}</div>
        </div>
    `;
    /* eslint-enable new-cap */
}

function CostOrError(props: { cost: number | null, error: string | null, update: () => void }) {
    if (props.cost === null && props.error === null) {
        return html`
            <div class="text-green-400">
                <${Icons.Refresh} class="animate-spin w-6 h-6" />
            </div>
        `;
    }

    if (props.cost !== null) {
        return html`
            <div class="text-green-400 font-bold">
                ${props.cost === 0 ? "FREE" : props.cost / 100 + " $"}
            </div>
        `;
    }

    return html`
        <div class="text-red-400 font-bold underline cursor-pointer" onClick=${props.update}>N/A</div>
        <div class="text-red-400 text-sm col-span-2">* ${props.error}</div>
    `;
}

function describe(message: string) {
    if (message === "30-min-required") {
        return "Only 30 minutes interval are enabled";
    }
    if (message === "free-soft-limit") {
        return "You used all free slots, please try tomorrow";
    }
    if (message === "free-hard-limit") {
        return "No more free slots, please try tomorrow";
    }

    return message;
}
