import { useDispatch, useSelector } from "react-redux";
import { Editor, HardwareCheckbox, IpxServerCheckbox, JspiCheckbox, MirroredControls, MobileControls,
    MouseCapture,
    OffscreenCanvasCheckbox,
    SystemCursor,
    WorkerCheckbox } from "../components/dos-option-checkbox";
import { BackendSelect, RenderAspectSelect, RenderSelect,
    SockdrivePreloadSelect, ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";
import { Play } from "../window/prerun-window";
import { State } from "../store";
import { dosSlice } from "../store/dos";

export function PreRunFrame(props: {}) {
    return <div class="prerun-frame frame-root items-start pl-4">
        <Play button={true} />
        <SystemCursor />
        <MouseCapture />
        <MobileControls />
        <MirroredControls />
        <MouseSensitiviySlider class="mt-4"/>
        <ScaleControlsSlider/>
        <VolumeSlider />
        <BackendSelect multiline={true} />
        <WorkerCheckbox />
        <JspiCheckbox />
        <OffscreenCanvasCheckbox />
        <div class="h-4" />
        <IpxServerCheckbox />
        <ConnectToIpxServer />
        <div class="h-4" />
        <RenderSelect multiline={true} />
        <RenderAspectSelect multiline={true} />
        <HardwareCheckbox />
        <Editor />
        <SockdrivePreloadSelect multiline={true} />
        <ThemeSelect multiline={true} />
    </div>;
}

function ConnectToIpxServer() {
    const dispatch = useDispatch();
    const ipxAddress = useSelector((state: State) => state.dos.connectIpxAddress);
    return <div class="flex flex-col mt-4 gap-2">
        <div>IPX Address</div>
        <input type="text" class="input input-bordered" value={ipxAddress ?? ""}
            onChange={(e) => dispatch(dosSlice.actions.connectIpxAddress((e.target as HTMLInputElement).value))} />
    </div>;
}
