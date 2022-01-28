import { html } from "../../dom";
import { Props } from "../../player-app";
import { Icons } from "../../icons";

interface LatencyInfoProps extends Props {
    class?: string,
    asButton?: boolean,
}

export function LatencyInfo(props: LatencyInfoProps) {
    if (props.latencyInfo === null) {
        return null;
    }

    const showLatencyInfoPage = (e: Event) => {
        props.setSideBarPage("latency-info");
        e.stopPropagation();
        e.preventDefault();
    };

    if (props.asButton === true && props.sideBarPage === "main") {
        return html`
        <div class="flex flex-row justify-between items-center cursor-pointer ${props.class} my-2"
            onClick=${showLatencyInfoPage}>
            <div class="">
                Show latency
            </div>
            <div>
                <${Icons.ArrowsCircleRight} class="text-green-400 h-6 -w-6" />
            </div>
        </div>
        `;
    }

    if (props.sideBarPage !== "latency-info") {
        return null;
    }

    const rows = [];
    for (const region of Object.keys(props.latencyInfo.estimation)) {
        const row = [];
        row.push(html`<div class="text-xs w-24 font-bold whitespace-nowrap break-words">${region}</div>`);
        for (let i = 0; i < 4; ++i) {
            row.push(html`
                <div class="text-xs text-gray-600 text-right">
                    ${props.latencyInfo.estimation[region][i]}
                </div>
            `);
        }
        rows.push(html`<div class="flex flex-row flex-wrap justify-between">${row}</div>`);
    }

    return html`
        <div class="sidebar-header">Latency</div>
        <div class="flex flex-col">
            ${rows}
        </div>
    `;
}
