import { html } from "../../dom";

import { Props } from "../../player-app";
import { Client } from "../client";
import { Controls } from "../controls";
import { Region } from "../region";
import { LatencyInfo } from "./latency-info";
import { Icons } from "../../icons";
import { SideBarCpuControl } from "../cpu-control";
import { SideBarScaleControl } from "../scale-control";
import { SideBarVolumeControl } from "../volume-control";
import { SideBarSensitivityControl } from "../sensitivity-control";
import { JSX } from "preact";

export function Main(props: Props) {
    if (props.sideBarPage !== "main") {
        return null;
    }

    const withNetworkingApi = props.options().withNetworkingApi === true;

    return html`
        <${Client} class="mt-2 mb-2 pb-2 border-b-2 border-green-200" ...${props} />
        <${Controls} class="mt-2" portal=${false} ...${props} />
        
        ${ withNetworkingApi && html`<div class="sidebar-header mt-8">Networking</div>` }
        ${ withNetworkingApi && html`<${Region} class="mt-2" ...${props} />` }
        ${ withNetworkingApi && html`<${LatencyInfo} ...${props} class="mt-4" asButton=${true} />` }
        ${ withNetworkingApi && html`<${ConfigureNetworking} ...${props} class="mt-2" />` }

        <div class="sidebar-header mt-8">Configuration</div>
        ${ false && html`<${LabeledSlideBar} label="CPU" slideBar=${SideBarCpuControl} appProps=${props} />` }
        <${LabeledSlideBar} label="Volume" slideBar=${SideBarVolumeControl} appProps=${props} />
        <${LabeledSlideBar} label="Sensitivity" slideBar=${SideBarSensitivityControl} appProps=${props} />
        <${LabeledSlideBar} label="Scale" slideBar=${SideBarScaleControl} appProps=${props} />
    `;
}

function LabeledSlideBar(props: {
    label: string,
    slideBar: JSX.Element,
    appProps: Props,
}) {
    return html`<div class="flex flex-row items-center justify-center my-2">
        <div class="w-20 text-sm overflow-hidden overflow-ellipsis">${props.label}</div>
        <div class="flex-grow"><${props.slideBar} ...${props.appProps} /></div>
    </div>`;
}

function ConfigureNetworking(props: Props & { class?: string }) {
    if (props.region === null) {
        return null;
    }

    return html`
        <div class="flex flex-row justify-between items-center cursor-pointer ${props.class}"
                onClick=${() => props.setSideBarPage("networking")}>
            <div class="">
                ${ props.ipxConnected ? "IPX [Connected]" : "Configure networks" }
            </div>
            <div>
                <${Icons.ArrowsCircleRight} class="text-green-400 h-6 -w-6" />
            </div>
        </div>
    `;
}
