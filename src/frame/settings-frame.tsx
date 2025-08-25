import {
    MirroredControls, MobileControls,
    MouseCapture, SystemCursor, PauseCheckbox,
} from "../components/dos-option-checkbox";
import { ImageRenderingSelect, RenderAspectSelect, ThemeSelect } from "../components/dos-option-select";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";
import { useT } from "../i18n";
import { useNonSerializableStore } from "../store";
/* eslint-disable-next-line camelcase */
import { KBD_leftalt, KBD_leftctrl, KBD_tab, KBD_delete } from "../window/dos/controls/keys";

export function SettingsFrame(props: {}) {
    return <div class="settings-frame frame-root items-start pl-4">
        <PauseCheckbox />
        <SystemCursor />
        <MouseCapture />
        <MobileControls />
        <MirroredControls />
        <MouseSensitiviySlider class="mt-4" />
        <ScaleControlsSlider />
        <VolumeSlider />
        <SpecialKeys />
        <RenderAspectSelect multiline={true} />
        <ImageRenderingSelect multiline={true} />
        <ThemeSelect multiline={true} />
    </div>;
}

function SpecialKeys() {
    const t = useT();
    const ns = useNonSerializableStore();
    return <div class="flex flex-col gap-2">
        <label>{t("special_keys")}</label>
        <div class="join">
            <button class="btn btn-sm btn-ghost join-item" onClick={() => {
                ns.ci?.simulateKeyPress(KBD_leftalt, KBD_tab);
            }}>Alt + Tab</button>
            <button class="btn btn-sm btn-ghost join-item" onClick={() => {
                ns.ci?.simulateKeyPress(KBD_leftctrl, KBD_leftalt, KBD_delete);
            }}>Ctrl + Alt + Del</button>
        </div>
    </div>;
}
