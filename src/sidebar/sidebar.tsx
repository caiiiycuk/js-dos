import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { OutputButton } from "./output-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);

    return <div class="sidebar">
        <div class="contentbar"></div>
        <div class="">
            { (window === "prerun" || window === "run") && <OutputButton /> }
            <AccountButton />
        </div>
    </div>;
};
