import { useEffect, useState } from "preact/hooks";
import { tokeInfoGet, tokenNewIpxGet } from "../../backend/v7/v7-config";
import { html } from "../../dom";
import { Icons } from "../../icons";
import { Props } from "../../player-app";
import { getObject } from "../../xhr";

const initialCountDown = 60;

interface Token {
    region: string,
    ttlSec: number,
    ipxArn?: string,
}

interface TokenProps extends Props {
    ipxIp: string | null,
    setIpxIp: (ipxIp: string | null) => void,

    awaitingIpx: boolean,
    setAwaitingIpx: (waitingIpx: boolean) => void,

    ipxCountDown: number,
    setIpxCountDown: (ipxCountDown: number) => void,
}

export function ActiveToken(props: Props) {
    const [token, setToken] = useState<Token | null>(null);
    const [awaiting, setAwaiting] = useState<boolean>(true);

    const [ipxIp, setIpxIp] = useState<string | null>(null);
    const [awaitingIpx, setAwaitingIpx] = useState<boolean>(false);
    const [ipxCountDown, setIpxCountDown] = useState<number>(initialCountDown);

    const tokenProps: TokenProps = {
        ...props,

        ipxIp,
        setIpxIp,

        awaitingIpx,
        setAwaitingIpx,

        ipxCountDown,
        setIpxCountDown,
    };

    useEffect(() => {
        update();
    }, [props.networkToken]);

    useEffect(() => {
        let runCount = 0;

        const id = setInterval(() => {
            if (awaitingIpx && ipxCountDown > 0) {
                setIpxCountDown(ipxCountDown - 1);
            }

            ++runCount;
        }, 1000);

        return () => {
            clearInterval(id);
        };
    }, [ipxIp, setIpxIp, awaitingIpx, setAwaitingIpx, ipxCountDown, setIpxCountDown]);

    async function update() {
        setIpxIp(null);
        setAwaitingIpx(false);
        setIpxCountDown(initialCountDown);

        if (props.networkToken === null) {
            setToken(null);
            return;
        }

        setAwaiting(true);
        getObject(tokeInfoGet + `?token=${props.networkToken}`).then((token: Token) => {
            setToken(token);
            setAwaiting(false);

            if (token.ipxArn !== undefined) {
                setAwaitingIpx(true);
            }
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
            <${IPX} ...${tokenProps} />
            <${NewInstance} ...${props} class="bg-gray-200" />
        </div>
    `;
}

function IPX(props: TokenProps) {
    const [awaiting, setAwaiting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function start() {
        setAwaiting(true);
        getObject(tokenNewIpxGet + `?token=${props.networkToken}`)
            .then(() => {
                setAwaiting(false);
                props.setIpxIp(null);
                props.setAwaitingIpx(true);
                props.setIpxCountDown(initialCountDown);
            })
            .catch((e) => {
                setError(e);
                setAwaiting(false);
            });
    }

    if (error !== null) {
        return html`
            <div class="text-red-400 col-span-2">${error}</div>
        `;
    }

    if (awaiting) {
        return html`
            <${Icons.Refresh} class="w-6 h-6 col-span-2 animate-spin" />
        `;
    }

    if (props.ipxIp !== null) {
        return html`
            <div class="font-bold">IPX:</div>
            <div class="text-gray-400">${props.ipxIp}</div>
        `;
    }

    if (props.awaitingIpx) {
        return html`
            <div class="font-bold">IPX:</div>
            <div class="text-gray-400 flex flex-row">
                <${Icons.Refresh} class="w-6 h-6 animate-spin mr-2" />
                ${props.ipxCountDown > 0 ? props.ipxCountDown + " sec" : ""}
            </div>
        `;
    }

    return html`
        <div class="font-bold">IPX:</div>
        <div class="bg-green-200 cursor-pointer rounded uppercase text-center px-4 py-1" onClick=${start}>Start</div>
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
                                            ${props.class ? props.class : " bg-green-200"}" onClick=${() =>
            props.setShowNewInstance(true)}>
            New Instance
        </div>
    `;
}

function toMin(time: number) {
    return Math.round(time / 60 * 10) / 10;
}
