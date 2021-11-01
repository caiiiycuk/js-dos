import { html } from "../dom";
import { Icons } from "../icons";

import { Props } from "../player-app";

export function ActionHide(props: Props) {
    return html`
    <div class="filter transition-opacity duration-1000 absolute z-50 
                        bg-gray-200 ${props.actionBar ? "" : "opacity-80"}
                        w-5 h-12 top-1/2 -mt-6 ${props.actionBar ? "left-10" : "left-0"}
                        rounded-r-md cursor-pointer" onClick=${() => props.setActionBar(!props.actionBar)}>
        <div class="h-4 w-4 my-4">
            <${props.actionBar ? Icons.ChevronLeft : Icons.ChevronRight} class="h-4 w-4" />
        </div>
    </div>
    `;
}
