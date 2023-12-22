import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { FullscreenButton } from "./fullscreen-button";
import { NetworkButton } from "./network-button";
import { CloudSaveButton } from "./cloud-save-button";
import { DosboxConfButton, SettingsButton, CyclesButton, FsButton,
    HostCacheButton, QuickSaveButton, ImageRenderingButton, HddLed } from "./sidebar-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const backend = useSelector((state: State) => state.dos.backend);

    return <div class="sidebar">
        {window === "run" && backend === "dosbox" && <CloudSaveButton />}
        {window === "run" && backend === "dosboxX" && <QuickSaveButton />}
        {window === "run" && <ImageRenderingButton />}
        {window === "run" && <NetworkButton />}
        {false && window === "select" && <HostCacheButton />}
        {editor && window === "prerun" && <DosboxConfButton />}
        {editor && window === "run" && <FsButton />}
        <div class="contentbar"></div>
        {window === "run" && <FullscreenButton />}
        {window === "run" && <CyclesButton />}
        {window === "run" && <HddLed />}
        {(window === "prerun" || window === "run") && <SettingsButton />}
        {window !== "run" && <AccountButton />}
    </div>;
};
