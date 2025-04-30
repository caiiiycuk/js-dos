import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { FullscreenButton } from "./fullscreen-button";
import { NetworkButton } from "./network-button";
import {
    DosboxConfButton, SettingsButton, CyclesButton, FsButton,
    HddLed,
    SoftKeyboardButton,
    PreRunButton,
} from "./sidebar-button";
import { SaveButtons } from "./save-buttons";
import { Slider } from "../components/slider";
import { dosSlice } from "../store/dos";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const networking = !useSelector((state: State) => state.ui.noNetworking);
    const frame = useSelector((state: State) => state.ui.frame) !== "none";
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);

    if (kiosk) {
        return null;
    }

    return <div class="sidebar">
        {window === "run" && <SaveButtons />}
        {window === "run" && <SoftKeyboardButton />}
        {window === "run" && networking && <NetworkButton />}
        {editor && window === "prerun" && <DosboxConfButton />}
        {editor && window === "run" && <FsButton />}
        <div class="contentbar"></div>
        {window === "run" && <FullscreenButton />}
        {window === "run" && <CyclesButton />}
        {window === "run" && <HddLed />}
        {window === "prerun" && <PreRunButton />}
        {window === "run" && <SettingsButton />}
        {!frame && window === "run" && mouseCapture && <SidebarSlider />}
    </div>;
};

function SidebarSlider(props: {}) {
    const sensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    const dispatch = useDispatch();
    return <div class="sidebar-slider">
        <Slider
            bgClass="bg-base-300"
            vertical={true}
            label=""
            value={sensitivity}
            onChange={(value) => {
                dispatch(dosSlice.actions.mouseSensitivity(value));
            }}
        >
            <svg class="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V7M12 21C8.68629 21 6 18.3137 6 15V9C6 5.68629
                        8.68629 3 12 3C15.3137 3 18 5.68629 18 9V15C18 18.3137 15.3137 21 12 21Z"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </Slider>
    </div>;
}
