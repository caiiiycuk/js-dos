import { Editor, MouseCapture, PauseCheckbox } from "../components/dos-option-checkbox";
import { ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, VolumeSlider } from "../components/dos-option-slider";

export function SettingsFrame(props: {}) {
    return <div class="settings-frame frame-root items-start pl-4">
        <PauseCheckbox />
        <MouseCapture />
        <MouseSensitiviySlider />
        <VolumeSlider />
        <Editor />
        <ThemeSelect multiline={true} />
    </div>;
}
