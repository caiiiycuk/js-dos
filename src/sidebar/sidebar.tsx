import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { SettingsButton } from "./settings-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);

    return <div class="sidebar">
        <div class="contentbar"></div>
        <div class="">
            { (window === "prerun" || window === "run") && <SettingsButton /> }
            <AccountButton />
        </div>
    </div>;
};
