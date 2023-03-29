import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { FullscreenButton } from "./fullscreen-button";
import { NetworkButton } from "./network-button";
import { SaveButton } from "./save-button";
import { DosboxConfButton, SettingsButton, CyclesButton, FsButton,
    HostCacheButton, QuickSaveButton } from "./sidebar-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const backend = useSelector((state: State) => state.dos.backend);

    return <div class="sidebar">
        {window === "run" && <SaveButton />}
        {window === "run" && backend === "dosboxX" && <QuickSaveButton />}
        {window === "select" && <HostCacheButton />}
        {window === "prerun" && <DosboxConfButton />}
        {editor && window === "run" && <FsButton />}
        <div class="contentbar"></div>
        {window === "run" && <NetworkButton />}
        {window === "run" && <FullscreenButton />}
        {window === "run" && <CyclesButton />}
        {(window === "prerun" || window === "run") && <SettingsButton />}
        {window !== "run" && <AccountButton />}
    </div>;
};
