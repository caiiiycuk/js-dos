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
                room: "default",
                address: "localhost",
            }) as any);
        }
    }

    return <div class="network-frame frame-root items-start px-4">
        <Checkbox
            class={network.ipx === "error" ? "error" : ""}
            onChange={toggleIpx}
            label="IPX"
            checked={network.ipx === "connected"}
            disabled={network.ipx === "connecting"}
            intermediate={network.ipx === "connecting"}
        />
    </div>;
}
