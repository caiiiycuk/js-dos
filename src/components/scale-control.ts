import { Props } from "../player-app";
import { html } from "../dom";
import { Icons } from "../icons";
import { VerticalSlider } from "./vertical-slider";
import { HorizontalSlider } from "./horizontal-slider";

const minScale = 0.8;
const maxScale = 2.5;

export function ActionBarScaleControl(props: Props) {
    if (!props.mobileControls && !props.mirroredControls) {
        return null;
    }

    return html`
        <${VerticalSlider} minValue=${minScale} maxValue=${maxScale}
            initialValue=${props.player().scaleControls} 
            onChange=${(v: number) => props.player().setScaleControls(v)}
            icon=${props.mirroredControls ? Icons.SwithcHorizontal : Icons.Mobile}
            registerListner=${props.player().registerOnScaleChanged}
            removeListener=${props.player().removeOnScaleChanged}
            />
    `;
}

export function SideBarScaleControl(props: Props) {
    return html`
        <${HorizontalSlider} minValue=${minScale} maxValue=${maxScale}
            initialValue=${props.player().scaleControls} 
            onChange=${(v: number) => props.player().setScaleControls(v)}
            icon=${props.mirroredControls ? Icons.SwithcHorizontal : Icons.Mobile}
            registerListner=${props.player().registerOnScaleChanged}
            removeListener=${props.player().removeOnScaleChanged}
            />
    `;
}
