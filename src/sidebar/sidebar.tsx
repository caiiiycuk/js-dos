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
import { uiSlice } from "../store/ui";

export function SideBar(props: {}) {
    const window = useSelector((state: State) => state.ui.window);
    const editor = useSelector((state: State) => state.ui.editor);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const networking = !useSelector((state: State) => state.ui.noNetworking);
    const frame = useSelector((state: State) => state.ui.frame) !== "none";
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const sidebarThin = useSelector((state: State) => state.ui.thinSidebar);
    const dispatch = useDispatch();
    if (kiosk) {
        return null;
    }

    if (sidebarThin) {
        return <div class="sidebar-thin">
            <div class="cursor-pointer hover:bg-base-100 w-full h-full flex flex-col items-center justify-center gap-1"
                onClick={() => {
                    dispatch(uiSlice.actions.thinSidebar(false));
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75
                        0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3
                         0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
            </div>
            {!frame && window === "run" && mouseCapture && <SidebarSlider />}
        </div>;
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
