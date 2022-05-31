import { html } from "../dom";
import { Icons } from "../icons";

import { Props } from "../player-app";

export function ActionHide(props: Props & { class: string }) {
    return html`
    <div class="filter transition-opacity duration-1000
                        bg-gray-200 ${props.class}
                        w-5 h-12
                        rounded-r-md cursor-pointer" onClick=${() => props.setActionBar(!props.actionBar)}>
        <div class="h-4 w-4 my-4">
            <${props.actionBar ? Icons.ChevronLeft : Icons.ChevronRight} class="h-4 w-4" />
        </div>
    </div>
    `;
}
