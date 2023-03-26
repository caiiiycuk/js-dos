import { useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox } from "../components/checkbox";
import { useT } from "../i18n";
import { State } from "../store";
import { dosExtraActions, dosSlice } from "../store/dos";
import { uiSlice } from "../store/ui";

export function NetworkFrame() {
    const account = useSelector((state: State) => state.auth.account);
    const network = useSelector((state: State) => state.dos.network);
    const t = useT();
    const dispatch = useDispatch();
    const [room, setRoom] = useState<string>(account == null ? "default" :
        "@" + account.email.substring(0, account.email.indexOf("@")));
    const [server, setServer] = useState<string>("jsdos-netherlands");

    function login() {
        dispatch(uiSlice.actions.modalLogin());
    }

    if (account === null) {
        return <div class="network-frame frame-root items-center" onClick={login}>
            <button class="btn-primary">{t("please_login")}</button>
        </div>;
    }

    function toggleIpx() {
        if (network.ipx === "connected") {
            dispatch(dosSlice.actions.disconnectIpx());
        } else {
            dispatch(dosExtraActions.connectIpx({
                room,
                address: server === "jsdos-netherlands" ?
                    "127.0.0.1" :
                    server,
            }) as any);
        }
    }

    return <div class="network-frame frame-root items-start px-4">
        <div class="form-control w-full">
            <label class="label">
                <span class="label-text">{t("server")}:</span>
                <span class={"label-text-alt " +
                    (account.premium ? "text-success" : "text-error")}>
                    {t("premium").toLowerCase()}
                </span>
            </label>
            <input type="text"
                class="input w-full input-sm input-bordered"
                onChange={(e) => setServer(e.currentTarget.value ?? "default")}
                value={server}
                disabled={!account.premium}></input>
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
            class={"mt-8 " + (network.ipx === "error" ? "error" : "")}
            onChange={toggleIpx}
            label="IPX"
            checked={network.ipx === "connected"}
            disabled={network.ipx === "connecting"}
            intermediate={network.ipx === "connecting"}
        />
    </div>;
}
