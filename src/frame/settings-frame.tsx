import { Editor, MirroredControls, MobileControls,
    MouseCapture, PauseCheckbox } from "../components/dos-option-checkbox";
import { ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";

export function SettingsFrame(props: {}) {
    return <div class="settings-frame frame-root items-start pl-4">
        <PauseCheckbox />
        <MouseCapture />
        <MobileControls />
        <MirroredControls />
        <ScaleControlsSlider class="mt-4" />
        <MouseSensitiviySlider />
        <VolumeSlider />
        <Editor />
        <ThemeSelect multiline={true} />
    </div>;
}
