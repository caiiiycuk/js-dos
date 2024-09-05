import { MirroredControls, MobileControls,
    MouseCapture, SystemCursor, PauseCheckbox } from "../components/dos-option-checkbox";
import { ImageRenderingSelect, RenderAspectSelect, ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";

export function SettingsFrame(props: {}) {
    return <div class="settings-frame frame-root items-start pl-4">
        <PauseCheckbox />
        <SystemCursor />
        <MouseCapture />
        <MobileControls />
        <MirroredControls />
        <ScaleControlsSlider class="mt-4" />
        <MouseSensitiviySlider />
        <VolumeSlider />
        <RenderAspectSelect multiline={true} />
        <ImageRenderingSelect multiline={true} />
        <ThemeSelect multiline={true} />
    </div>;
}
