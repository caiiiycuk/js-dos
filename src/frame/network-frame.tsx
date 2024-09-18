import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "../components/checkbox";
import { useT } from "../i18n";
import { State } from "../store";
import { dosSlice } from "../store/dos";
import { Select } from "../components/select";
import { uiSlice } from "../store/ui";
import { Dispatch } from "@reduxjs/toolkit";

export function NetworkFrame() {
    const network = useSelector((state: State) => state.dos.network);
    const room = network.room;
    const server = network.server;
    const disabled = network.ipx !== "disconnected";
    const t = useT();
    const dispatch = useDispatch();
    const ipxLink =
        network.ipx === "connected" ?
            location.href + searchSeparator() +
            "ipx=1&server=" + network.server + "&room=" + room :
            null;

    function setRoom(room: string) {
        dispatch(dosSlice.actions.setRoom(room));
    }

    function setServer(server: string) {
        dispatch(dosSlice.actions.setServer(server as any));
    }

    function toggleIpx() {
        if (network.ipx === "connected") {
            dispatch(dosSlice.actions.disconnectIpx({}));
        } else {
            dispatch(dosSlice.actions.connectIpx({
                room,
                address: "wss://" + server + ".dos.zone",
            }) as any);
        }
    }

    function copyAndClose() {
        if (ipxLink) {
            copyToClipBoard(ipxLink, t, dispatch);
            dispatch(uiSlice.actions.frameNone());
        }
    }

    function onServer(newServer: string) {
        setServer(newServer);
    }

    return <div class="network-frame frame-root items-start px-4 relative">
        <div class="ml-1 mb-4 w-full flex flex-row items-center">
            <Select
                class="text-sm"
                selectClass="w-full"
                label={t("server") + ":"}
                selected={server}
                values={["netherlands", "newyork", "singapore"]}
                disabled={disabled}
                onSelect={onServer}
            />
        </div>
        <div class="form-control w-full">
            <label class="label">
                <span class="label-text">{t("room")}:</span>
            </label>
            <input type="text"
                class="input w-full input-sm input-bordered"
                disabled={disabled}
                onChange={(e) => setRoom(e.currentTarget.value)}
                value={room}></input>
        </div>
        <Checkbox
            class={"mt-4 " + (network.ipx === "error" ? "error" : "")}
            onChange={toggleIpx}
            label="IPX"
            checked={network.ipx === "connected"}
            disabled={network.ipx === "connecting"}
            intermediate={network.ipx === "connecting"}
        />

        {ipxLink !== null && <div class="mt-4 text-sm alert alert-success shadow-lg flex flex-col">
            <div>{t("copy_net_link")}:</div>
            <div class="flex flex-row">
                <svg xmlns="http://www.w3.org/2000/svg"
                    class="w-6 h-6 mx-1 cursor-pointer hover:text-accent-focus flex-shrink-0"
                    fill="none" onClick={copyAndClose}
                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125
                        1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06
                        9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504
                        1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0
                        00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5
                        10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12
                        6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125
                         0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                <div class="contextmenu underline break-all"
                    target="_blank">{ipxLink}</div>
            </div>
        </div>}
    </div >;
}

function searchSeparator() {
    if (location.href.endsWith("?") || location.href.endsWith("&")) {
        return "";
    }
    return location.href.indexOf("?") > 0 ? "&" : "?";
}

async function copyToClipBoard(text: string,
                               t: (key: string) => string,
                               dispatch: Dispatch) {
    if (!navigator.clipboard) {
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        dispatch(uiSlice.actions.showToast({
            message: t("copied"),
            intent: "success",
        }));
    } catch (e: any) {
        dispatch(uiSlice.actions.showToast({
            message: t("error"),
            intent: "error",
        }));
    }
}
