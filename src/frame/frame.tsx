import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountFrame } from "./account-frame";

export function Frame(props: {}) {
    const frame = useSelector((state: State) => state.app.frame);
    if (frame === "none") {
        return null;
    }

    return <div class="frame">
        { frame === "account" && <AccountFrame /> }
    </div>;
};
