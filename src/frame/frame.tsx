import { useSelector } from "react-redux";
import { State } from "../store";
import { EditorConf } from "./editor/editor-conf-frame";
import { EditorFsFrame } from "./editor/editor-fs-frame";
import { FatDrivesFrame } from "./fat-drives-frame";
import { NetworkFrame } from "./network-frame";
import { SettingsFrame } from "./settings-frame";
import { StatsFrame } from "./stats-frame";
import { PreRunFrame } from "./prerun-frame";

export function Frame(props: {}) {
    const frame = useSelector((state: State) => state.ui.frame);
    const frameXs = useSelector((state: State) => state.ui.frameXs);
    const wideScreen = useSelector((state: State) => state.ui.wideScreen);
    if (frame === "none") {
        return null;
    }


    return <div class={"frame " + (frameXs ? " frame-xs " : "") +
        (frameXs || wideScreen ? "" : " frame-md")}>
        { frame === "settings" && <SettingsFrame /> }
        { frame === "editor-conf" && <EditorConf /> }
        { frame === "editor-fs" && <EditorFsFrame /> }
        { frame === "network" && <NetworkFrame /> }
        { frame === "stats" && <StatsFrame /> }
        { frame === "fat-drives" && <FatDrivesFrame /> }
        { frame === "prerun" && <PreRunFrame /> }
    </div>;
};
