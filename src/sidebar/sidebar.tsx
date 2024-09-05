import { useSelector } from "react-redux";
import { State } from "../store";
import { AccountButton } from "./account-button";
import { FullscreenButton } from "./fullscreen-button";
import { NetworkButton } from "./network-button";
import {
    DosboxConfButton, SettingsButton, CyclesButton, FsButton,
    FatDrivesButton, HddLed,
    SoftKeyboardButton,
    PreRunButton,
} from "./sidebar-button";
import { SaveButtons } from "./save-buttons";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const backend = useSelector((state: State) => state.dos.backend);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const networking = !useSelector((state: State) => state.ui.noNetworking);
    const cloud = !useSelector((state: State) => state.ui.noCloud);

    if (kiosk) {
        return null;
    }

    return <div class="sidebar">
        {window === "run" && <SaveButtons />}
        {window === "run" && <SoftKeyboardButton />}
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
