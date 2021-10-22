import { html } from "../dom";

import { Props } from "../player-app";

export function ActionButton(props: Props) {
    if (props.sideBar) {
        return null;
    }

    return html`
    <div class="filter absolute 
                    w-16 h-16 top-4 right-4 
                    bg-blue-200 hover:bg-yellow-200
                    rounded-full ring-2 ring-gray-400
                    drop-shadow cursor-pointer" onClick=${props.openSideBar}>
    </div>
    `;
}
