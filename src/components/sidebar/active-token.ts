import { useEffect, useState } from "preact/hooks";
import { tokeInfoGet } from "../../backend/v7/v7-config";
import { html } from "../../dom";
import { Icons } from "../../icons";
import { Props } from "../../player-app";
import { getObject } from "../../xhr";

interface Token {
    region: string,
    ttlSec: number,
}

export function ActiveToken(props: Props) {
    const [token, setToken] = useState<Token | null>(null);
    const [awaiting, setAwaiting] = useState<boolean>(true);

    useEffect(() => {
        update();
    }, [props.networkToken]);

    async function update() {
        if (props.networkToken === null) {
            setToken(null);
            return;
        }

        setAwaiting(true);
        getObject(tokeInfoGet + `?token=${props.networkToken}`).then((t: Token) => {
            setToken(t);
            setAwaiting(false);
        }).catch((e) => {
            console.error("Can't get a token", props.networkToken, e);
            setToken(null);
            setAwaiting(false);
        });
    }

    if (awaiting) {
        return html`
            <div class="sidebar-header">Active</div>
            <div class="grid grid-cols-2 gap-4">
                <${Icons.Refresh} class="w-6 h-6 animate-spin" />
            </div>
    `;
    }

    if (token === null) {
        return html`
            <div class="sidebar-header">Active</div>
            <div class="grid grid-cols-2 gap-4">
                <${TokenSelect} ...${props} networkToken=${null} />
                <${NewInstance} ...${props} />
            </div>
        `;
    }

    if (token.ttlSec < 0) {
        return html`
            <div class="sidebar-header">Active</div>
            <div class="grid grid-cols-2 gap-4">
                <${TokenSelect} ...${props} />
                <div class="font-bold">TTL:</div>
                <div class="text-red-400">ended</div>
                <${NewInstance} ...${props} />
            </div>
        `;
    }

    return html`
        <div class="sidebar-header">Active</div>
        <div class="grid grid-cols-2 gap-4">
            <${TokenSelect} ...${props} />
            <div class="font-bold">TTL:</div>
            <div class="text-gray-400 underline" onClick=${update}>${toMin(token.ttlSec)} Min</div>
            <div class="font-bold">Region:</div>
            <div class="text-gray-400">${token.region}</div>
            <${IPX} ...${props} />
            <${NewInstance} ...${props} class="bg-gray-200" />
        </div>
    `;
}

function IPX(props: Props) {
    return html`
        <div class="font-bold">IPX:</div>
        <div class="bg-green-200 cursor-pointer rounded uppercase text-center px-4 py-1">Start</div>
    `;
}

function TokenSelect(props: Props) {
    function changeToken() {
        const newToken = prompt("Set token", props.networkToken || "");
        if (newToken !== null) {
            props.setNetworkToken(newToken);
        }
    }

    return html`
        <div class="font-bold">Token:</div>
        <div class="text-green-400 underline cursor-pointer" onClick=${changeToken}>
            ${props.networkToken === null ? "NOT SET" : props.networkToken}
        </div>
    `;
}

function NewInstance(props: Props & { class?: string }) {
    if (props.showNewInstance) {
        return null;
    }

    return html`
        <div class="cursor-pointer col-span-2 rounded uppercase text-center px-4 py-1 
            ${props.class ? props.class : "bg-green-200"}" 
            onClick=${() => props.setShowNewInstance(true)}>
            New Instance
        </div>
    `;
}

function toMin(time: number) {
    return Math.round(time / 60 * 10) / 10;
}
