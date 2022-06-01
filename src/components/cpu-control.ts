import { Props } from "../player-app";
import { html } from "../dom";
import { Icons } from "../icons";
import { HorizontalSlider } from "./horizontal-slider";

const minCpu = 100;
const maxCpu = 5000;

export function SideBarCpuControl(props: Props) {
    return html`
        <${HorizontalSlider} minValue=${minCpu} maxValue=${maxCpu}
            maxLabel="max"
            initialValue=${5000} 
            onChange=${(v: number) => {/* TODO */}}
            icon=${Icons.VolumeUp}
            registerListner=${() => {}}
            removeListener=${() => {}}
            />
    `;
}
