import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountFrame } from "./account-frame";
import { OutputFrame } from "./output-frame";

export function Frame(props: {}) {
    const frame = useSelector((state: State) => state.ui.frame);
    if (frame === "none") {
        return null;
    }

    return <div class="frame">
        { frame === "account" && <AccountFrame /> }
        { frame === "output" && <OutputFrame />}
    </div>;
};
