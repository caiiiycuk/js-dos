import { html } from "../dom";
import { Props } from "../player-app";
import { useState } from "preact/hooks";

interface LatencyInfoProps extends Props {
    class?: string,
}

export function LatencyInfo(props: LatencyInfoProps) {
    const [showInfo, setShowInfo] = useState<boolean>(false);

    const toggleShowInfo = (e: Event) => {
        setShowInfo(!showInfo);
        e.stopPropagation();
        e.preventDefault();
    };

    if (props.latencyInfo === null) {
        return null;
    }

    if (showInfo === false) {
        return html`
            <div class="text-gray-400 text-xs underline cursor-pointer self-center" onClick=${toggleShowInfo}>
                show latency info
            </div>
        `;
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
            <div class="text-gray-400 text-xs underline cursor-pointer self-center mb-2" onClick=${toggleShowInfo}>
                hide latency info
            </div>
            <div class="flex flex-col">
                ${rows}
            </div>
    `;
}
