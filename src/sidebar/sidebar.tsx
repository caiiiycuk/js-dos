import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { FullscreenButton } from "./fullscreen-button";
import { NetworkButton } from "./network-button";
import { CloudSaveButton } from "./cloud-save-button";
import {
    DosboxConfButton, SettingsButton, CyclesButton, FsButton,
    FatDrivesButton, QuickSaveButton, HddLed,
    SoftKeyboardButton,
    PreRunButton,
} from "./sidebar-button";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const backend = useSelector((state: State) => state.dos.backend);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const networking = !useSelector((state: State) => state.ui.noNetworking);
    const cloud = !useSelector((state: State) => state.ui.noCloud);
    const mobileControls = useSelector((state: State) => state.dos.mobileControls);

    if (kiosk) {
        return null;
    }

    return <div class="sidebar">
        {window === "run" && backend === "dosbox" && <CloudSaveButton />}
        {window === "run" && backend === "dosboxX" && <QuickSaveButton />}
        {window === "run" && mobileControls && <SoftKeyboardButton />}
        {window === "run" && networking && <NetworkButton />}
        {editor && window === "prerun" && <DosboxConfButton />}
        {editor && window === "prerun" && backend === "dosboxX" && <FatDrivesButton />}
        {editor && window === "run" && <FsButton />}
        <div class="contentbar"></div>
        {window === "run" && <FullscreenButton />}
        {window === "run" && <CyclesButton />}
        {window === "run" && <HddLed />}
        {window === "prerun" && <PreRunButton />}
        {window === "run" && <SettingsButton />}
        {window !== "run" && cloud && <AccountButton />}
    </div>;
};
