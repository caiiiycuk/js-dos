import { Props } from "../player-app";
import { html } from "../dom";
import { Icons } from "../icons";
import { VerticalSlider } from "./vertical-slider";
import { HorizontalSlider } from "./horizontal-slider";

const minVolume = 0;
const maxVolume = 1;

export function ActionBarVolumeControl(props: Props) {
    if (props.mobileControls || props.mirroredControls) {
        return null;
    }

    return html`
        <${VerticalSlider} minValue=${minVolume} maxValue=${maxVolume}
            initialValue=${1.0} 
            onChange=${(v: number) => {/* TODO */}}
            icon=${Icons.VolumeUp}
            />
    `;
}

export function SideBarVolumeControl(props: Props) {
    return html`
        <${HorizontalSlider} minValue=${minVolume} maxValue=${maxVolume}
            initialValue=${1.0} 
            onChange=${(v: number) => {/* TODO */}}
            icon=${Icons.VolumeUp}
            />
    `;
}
