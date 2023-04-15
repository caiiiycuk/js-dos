import { useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "../components/checkbox";
import { useT } from "../i18n";
import { State } from "../store";
import { dosExtraActions, dosSlice } from "../store/dos";
import { Select } from "../components/select";
import { lStorage } from "../host/lstorage";
import { uiSlice } from "../store/ui";
import { LockBadge } from "../components/lock";

export function NetworkFrame() {
    const account = useSelector((state: State) => state.auth.account);
    const network = useSelector((state: State) => state.dos.network);
    const t = useT();
    const dispatch = useDispatch();
    const [room, setRoom] = useState<string>(account == null ? "default" :
        "@" + account.email.substring(0, account.email.indexOf("@")));
    const premium = account?.premium === true;
    const [server, setServer] = useState<string>((premium ? lStorage.getItem("net.server") : null) ??"netherlands");

    function toggleIpx() {
        if (network.ipx === "connected") {
            dispatch(dosSlice.actions.disconnectIpx());
        } else {
            dispatch(dosExtraActions.connectIpx({
                room,
                address: "wss://" + (premium ? server : "netherlands") + ".dos.zone",
            }) as any);
            dispatch(uiSlice.actions.frameNone());
        }
    }

    function lockClick() {
        dispatch(uiSlice.actions.frameAccount());
    }

    function onServer(newServer: string) {
        if (!premium) {
            dispatch(uiSlice.actions.frameAccount());
            return;
        }

        setServer(newServer);
    }

    return <div class="network-frame frame-root items-start px-4 relative">
        <div class="ml-1 mb-4 w-full flex flex-row items-center">
            <Select
                class="text-sm"
                selectClass="w-full"
                label={t("server") + ":"}
                selected="netherlands"
                values={["netherlands", "newyork", "singapore"]}
                onSelect={onServer}
            />
            <div onClick={lockClick}>
                <LockBadge class="cursor-pointer ml-2 w-4 h-4 text-error"/>
            </div>
        </div>
        <div class="form-control w-full">
            <label class="label">
                <span class="label-text">{t("room")}:</span>
            </label>
            <input type="text"
                class="input w-full input-sm input-bordered"
                onChange={(e) => setRoom(e.currentTarget.value ?? "default")}
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
    </div >;
}
