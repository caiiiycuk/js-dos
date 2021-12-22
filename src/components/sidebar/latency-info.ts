import { html } from "../../dom";
import { Props } from "../../player-app";

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
            <div class="text-gray-400 text-xs underline cursor-pointer self-center" onClick=${showLatencyInfoPage}>
                show latency info
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
