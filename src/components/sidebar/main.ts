import { html } from "../../dom";

import { Props } from "../../player-app";
import { Client } from "../client";
import { Controls } from "../controls";
import { Region } from "../region";
import { LatencyInfo } from "./latency-info";

export function Main(props: Props) {
    if (props.sideBarPage !== "main") {
        return null;
    }

    return html`
        <${Client} class="mt-2 mb-2 pb-2 border-b-2 border-green-200" ...${props} />
        <${Controls} class="mt-2" portal=${false} ...${props} />
        <div class="sidebar-header">Networking</div>
        <${Region} class="mt-2" ...${props} />
        <${LatencyInfo} ...${props} asButton=${true} />
    `;
}
