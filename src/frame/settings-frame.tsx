import { MouseCapture, PauseCheckbox } from "../components/dos-option-checkbox";
import { RenderAspectSelect, RenderSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, VolumeSlider } from "../components/dos-option-slider";

export function SettingsFrame(props: {}) {
    return <div class="settings-frame frame-root items-start pl-4">
        <PauseCheckbox />
        <RenderSelect />
        <RenderAspectSelect />
        <MouseCapture />
        <MouseSensitiviySlider />
        <VolumeSlider />
    </div>;
}
