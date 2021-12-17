import { html } from "../dom";
import { Props } from "../player-app";
import { Icons } from "../icons";

interface RegionProps extends Props {
    class?: string,
}

export function Region(props: RegionProps) {
    function resetRegion() {
        if (props.region === null) {
            return;
        }

        props.setRegion(null);
    }

    return html`
        <div class="flex flex-row justify-between items-center ${props.class}">
            <div class="text-gray-600">Region</div>
            <div class="px-4 overflow-hidden overflow-ellipsis whitespace-nowrap flex-shrink">
                ${props.region || props.estimatingRegion || "Connecting..."}
            </div>
            <div class="h-6 w-6 ${props.region === null ? "animate-spin" : "cursor-pointer"}" onClick=${resetRegion}>
                <${Icons.Refresh} class="h-6 w-6" />
            </div>
        </div>
    `;
}
