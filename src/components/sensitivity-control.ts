import { Props } from "../player-app";
import { html } from "../dom";
import { Icons } from "../icons";
import { VerticalSlider } from "./vertical-slider";
import { HorizontalSlider } from "./horizontal-slider";

const minSensitivity = 0.1;
const maxSensitivity = 4;

export function ActionBarSensitivityControl(props: Props) {
    if (!props.autolock) {
        return null;
    }

    return html`
        <${VerticalSlider} minValue=${minSensitivity} maxValue=${maxSensitivity}
            initialValue=${props.player().sensitivity} 
            onChange=${(v: number) => props.player().setSensitivity(v)}
            icon=${Icons.CursorClick}
            registerListner=${props.player().registerOnSensitivityChanged}
            removeListener=${props.player().removeOnSensitivityChanged}
            />
    `;
}

export function SideBarSensitivityControl(props: Props) {
    return html`
        <${HorizontalSlider} minValue=${minSensitivity} maxValue=${maxSensitivity}
            initialValue=${props.player().sensitivity} 
            onChange=${(v: number) => props.player().setSensitivity(v)}
            icon=${Icons.CursorClick}
            registerListner=${props.player().registerOnSensitivityChanged}
            removeListener=${props.player().removeOnSensitivityChanged}
            />
    `;
}
