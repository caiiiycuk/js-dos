import { Editor, HardwareCheckbox, MirroredControls, MobileControls,
    MouseCapture,
    SockdriveNative,
    SockdriveWrite,
    SystemCursor,
    WorkerCheckbox } from "../components/dos-option-checkbox";
import { BackendSelect, RenderAspectSelect, RenderSelect, ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";
import { Play } from "../window/prerun-window";

export function PreRunFrame(props: {}) {
    return <div class="prerun-frame frame-root items-start pl-4">
        <Play button={true} />
        <SystemCursor />
        <MouseCapture />
        <MobileControls />
        <MirroredControls />
        <ScaleControlsSlider class="mt-4" />
        <MouseSensitiviySlider />
        <VolumeSlider />
        <BackendSelect multiline={true} />
        <WorkerCheckbox />
        <RenderSelect multiline={true} />
        <RenderAspectSelect multiline={true} />
        <HardwareCheckbox />
        <SockdriveWrite />
        <Editor />
        <SockdriveNative />
        <ThemeSelect multiline={true} />
    </div>;
}
