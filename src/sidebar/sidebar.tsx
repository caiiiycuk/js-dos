import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { CyclesText } from "./cycles-text";
import { DosboxConfButton } from "./editor/editorconf-button";
import { SettingsButton } from "./settings-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);

    return <div class="sidebar">
        {window === "prerun" && <DosboxConfButton />}
        <div class="contentbar"></div>
        {window === "run" && <CyclesText />}
        {(window === "prerun" || window === "run") && <SettingsButton />}
        <AccountButton />
    </div>;
};
