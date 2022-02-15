import { useEffect, useState } from "preact/hooks";
import { tokeInfoGetEndpoint, startIpx, stopIpx } from "../../../backend/v7/v7-config";
import { html } from "../../../dom";
import { Icons } from "../../../icons";
import { Props } from "../../../player-app";
import { getObject, postObject } from "../../../xhr";
import { request } from "../../../request";

import { TokenSelect } from "./token-select";
import { TokenAddTime } from "./token-add-time";

const initialWaitCountDown = 30;
const NETWORK_DOSBOX_IPX = 0;

interface Token {
    region: string,
    ttlSec: number,
    ipxArn?: string | null,
    ipxAddress?: string | null,
}

interface IpxProps {
    ipxArn: string | null,
    setIpxArn: (ipxArn: string | null) => void,

    ipxAddress: string | null,
    setIpxAddress: (ipxAddress: string | null) => void,

    awaitingIpxAddress: boolean,
    setAwaitingIpxAddress: (waitingIpx: boolean) => void,
}
export interface TokenProps extends Props {
    ipx: IpxProps,
    update: () => void,
}

export function TokenConfiguration(props: Props) {
    const [token, setToken] = useState<Token | null>(null);
    const [awaiting, setAwaiting] = useState<boolean>(true);
    const [endTime, setEndTime] = useState<number>(Date.now());

    const [ipxArn, setIpxArn] = useState<string | null>(null);
    const [ipxAddress, setIpxAddress] = useState<string | null>(null);
    const [awaitingIpxAddress, setAwaitingIpxAddress] = useState<boolean>(false);

    const ipxProps: IpxProps = {
        ipxArn,
        setIpxArn,

        ipxAddress,
        setIpxAddress,

        awaitingIpxAddress,
        setAwaitingIpxAddress,
    };

    const tokenProps: TokenProps = {
        ...props,
        ipx: ipxProps,
        update,
    };

    useEffect(() => {
        update();
    }, [props.networkToken]);

    useEffect(() => {
        if (props.networkToken === null || endTime < Date.now()) {
            return;
        }

        const id = setInterval(() => {
            request(tokeInfoGetEndpoint + `?token=${props.networkToken}`).then((token: Token) => {
                token.ipxArn ||= null;
                token.ipxAddress ||= null;

                // desync
                if (ipxArn !== token.ipxArn) {
                    update();
                    return;
                }

                if (token.ipxAddress !== ipxAddress) {
                    setIpxAddress(token.ipxAddress);
                    setAwaitingIpxAddress(false);
                }
            });
        }, 5000);

        return () => {
            clearInterval(id);
        };
    }, [props.networkToken, endTime, ipxArn, ipxAddress]);

    async function update() {
        setIpxArn(null);
        setIpxAddress(null);
        setAwaitingIpxAddress(false);
        setAwaiting(true);

        if (props.networkToken === null) {
            setToken(null);
            setAwaiting(false);
            return;
        }

        request(tokeInfoGetEndpoint + `?token=${props.networkToken}`).then((token: Token) => {
            setToken(token);
            setAwaiting(false);
            setEndTime(Date.now() + token.ttlSec * 1000);

            if (token.ipxArn !== undefined) {
                setIpxArn(token.ipxArn);
            }

            if (token.ipxAddress !== undefined) {
                setIpxAddress(token.ipxAddress);
            } else if (token.ipxArn !== undefined) {
                setAwaitingIpxAddress(true);
            }
        }).catch((e: any) => {
            console.error("Can't get a token", props.networkToken, e);
            setToken(null);
            setAwaiting(false);
        });
    }

    if (awaiting) {
        return html`
            <div class="sidebar-header">Configuration</div>
            <div class="grid grid-cols-2 gap-4">
                <${Icons.Refresh} class="w-6 h-6 animate-spin" />
            </div>
    `;
    }

    if (token === null) {
        return html`
            <div class="sidebar-header">Configuration</div>
            <div class="grid grid-cols-2 gap-4">
                <${TokenSelect} ...${props} networkToken=${null} />
            </div>
        `;
    }

    const headerWithRefresh = html`
        <div class="sidebar-header flex flex-row justify-center items-center">
            Configuration
            <div onClick=${update} >
                <${Icons.Refresh} class="h-4 w-4 ml-2 cursor-pointer" />
            </div>
        </div>
    `;

    if (endTime < Date.now()) {
        return html`
            ${headerWithRefresh}
            <div class="grid grid-cols-2 gap-4">
                <${TokenSelect} ...${props} />
                <div class="font-bold">Region:</div>
                <div class="text-gray-400">${token.region}</div>
                <div class="font-bold">TTL:</div>
                <div class="text-red-400">0 Min</div>
                <${TokenAddTime} ...${tokenProps} />
            </div>
        `;
    }

    return html`
        ${headerWithRefresh}
        <div class="grid grid-cols-2 gap-4">
            <${TokenSelect} ...${props} />
            <div class="font-bold">Region:</div>
            <div class="text-gray-400">${token.region}</div>
            <${TokenTtlCountDown} endTime=${endTime} update=${update} />
            <${TokenAddTime} ...${tokenProps} />
            <${IPX} ...${tokenProps} />
        </div>
    `;
}

function TokenTtlCountDown(props: { endTime: number, update: () => void }) {
    const [ttlMs, setTtlMs] = useState<number>(props.endTime - Date.now());

    useEffect(() => {
        if (ttlMs <= 0) {
            return;
        }

        const id = setInterval(() => {
            const ttlMs = Math.max(0, props.endTime - Date.now());
            if (ttlMs === 0) {
                props.update();
                clearInterval(id);
            }

            setTtlMs(ttlMs);
        }, 10000);
        return () => clearInterval(id);
    }, [props.endTime]);

    return html`
        <div class="font-bold">TTL:</div>
        <div class="${ttlMs < 300 * 1000 ? " text-red-400" : "text-gray-400"} cursor-pointer underline"
            onClick=${props.update}>
            ${humanizeTime(ttlMs / 1000)}
        </div>
    `;
}

function IPX(props: TokenProps) {
    const [awaiting, setAwaiting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function start() {
        setAwaiting(true);
        getObject(startIpx + `?token=${props.networkToken}`)
            .then((response) => {
                setAwaiting(false);
                props.ipx.setIpxArn(response.arn);
                props.ipx.setAwaitingIpxAddress(true);
            })
            .catch((e) => {
                console.error("Can't start ipx", e);
                setError(e.errorCode ?? e.message);
                setAwaiting(false);
            });
    }

    function toggleConnected() {
        const newConnected = !props.ipxConnected;
        const address = props.ipx.ipxAddress;
        const port = 1901;

        if (!address) {
            return;
        }

        props.player().ciPromise?.then((ci) => {
            if (newConnected) {
                return ci.networkConnect(NETWORK_DOSBOX_IPX, address, port);
            }

            return ci.networkDisconnect(NETWORK_DOSBOX_IPX);
        })
            .then(() => {
                props.setIpxConnected(newConnected);
                if (newConnected) {
                    props.player().layers.notyf.success("Connected");
                    props.closeSideBar();
                }
            })
            .catch((e) => {
                console.error(e);
                setError(e.message);
            });
    }

    function stop() {
        setAwaiting(true);
        postObject(stopIpx + `?token=${props.networkToken}&arn=${props.ipx.ipxArn}`)
            .then(() => {
                setAwaiting(false);
                props.ipx.setIpxAddress(null);
                props.ipx.setAwaitingIpxAddress(false);
            })
            .catch((e) => {
                console.error("Can't stop ipx", e);
                setError(e.errorCode ?? e.message);
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

    if (props.ipx.ipxAddress !== null) {
        return html`
            <div class="font-bold">IPX:</div>
            <div class="font-bold text-green-400">${props.ipx.ipxAddress.replace(".jj.dos.zone", "")}</div>
            <div class=""></div>
            <div class="${props.ipxConnected ? " bg-red-200" : "bg-green-200"}
                cursor-pointer rounded uppercase text-center px-2 py-1"
                onClick=${toggleConnected}>${props.ipxConnected ? "Disconnect" : "Connect"}</div>
            <div class="${props.ipxConnected ? "hidden" : ""}"></div>
            <div class="${props.ipxConnected ? "hidden" : "none"}
                bg-gray-200 cursor-pointer rounded uppercase text-center px-4 py-1"
                onClick=${stop}>Stop</div>
        `;
    }

    if (props.ipx.awaitingIpxAddress) {
        return html`
            <div class="font-bold">IPX:</div>
            <${TaskWaitCountDown} />
            <div class=""></div>
            <div class="bg-gray-200 cursor-pointer rounded uppercase text-center px-4 py-1" onClick=${stop}>Stop</div>
        `;
    }

    return html`
        <div class="font-bold">IPX:</div>
        <div class="bg-green-200 cursor-pointer rounded uppercase text-center px-4 py-1" onClick=${start}>Start</div>
    `;
}

function TaskWaitCountDown() {
    const [countDown, setCountDown] = useState<number>(initialWaitCountDown);

    useEffect(() => {
        if (countDown === 0) {
            return;
        }

        const id = setTimeout(() => {
            setCountDown(countDown - 1);
        }, 1000);
        return () => clearTimeout(id);
    }, [countDown]);

    return html`
        <div class="text-gray-400 flex flex-row">
            <${Icons.Refresh} class="w-6 h-6 animate-spin mr-2" />
            ${countDown > 0 ? countDown + " sec" : ""}
        </div>
    `;
}


function humanizeTime(timeSec: number) {
    if (timeSec > 24 * 60 * 60) {
        const days = Math.round(timeSec / 24 / 60 / 60 * 10) / 10;
        return days + (days === 1 ? " Day" : " Days");
    }

    if (timeSec > 60 * 60) {
        const hours = Math.round(timeSec / 60 / 60 * 10) / 10;
        return hours + (hours === 1 ? " Hour" : " Hrs");
    }

    const minutes = Math.round(timeSec / 60 * 10) / 10;
    return minutes + " Min";
}
