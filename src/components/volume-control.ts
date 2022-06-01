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
            initialValue=${props.player().volume} 
            onChange=${(v: number) => props.player().setVolume(v)}
            icon=${Icons.VolumeUp}
            registerListner=${props.player().registerOnVolumeChanged}
            removeListener=${props.player().removeOnVolumeChanged}
            />
    `;
}

export function SideBarVolumeControl(props: Props) {
    return html`
        <${HorizontalSlider} minValue=${minVolume} maxValue=${maxVolume}
            initialValue=${props.player().volume} 
            onChange=${(v: number) => props.player().setVolume(v)}
            icon=${Icons.VolumeUp}
            registerListner=${props.player().registerOnVolumeChanged}
            removeListener=${props.player().removeOnVolumeChanged}
            />
    `;
}
