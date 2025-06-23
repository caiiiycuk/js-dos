import { Editor, HardwareCheckbox, MirroredControls, MobileControls,
    MouseCapture,
    OffscreenCanvasCheckbox,
    SystemCursor,
    WorkerCheckbox } from "../components/dos-option-checkbox";
import { BackendSelect, RenderAspectSelect, RenderSelect,
    SockdrivePreloadSelect, ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";
import { Play } from "../window/prerun-window";

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
        <OffscreenCanvasCheckbox />
        <RenderSelect multiline={true} />
        <RenderAspectSelect multiline={true} />
        <HardwareCheckbox />
        <Editor />
        <SockdrivePreloadSelect multiline={true} />
        <ThemeSelect multiline={true} />
    </div>;
}
