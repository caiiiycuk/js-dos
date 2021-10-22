import { html } from "../dom";
import { Icons } from "../icons";

import { Props } from "../player-app";

export function Client(props: { class?: string }) {
    return html`
    <div class="flex flex-row justify-center ${props.class}">
        <div class="h-6 w-6 text-green-400 mr-2">
            <${Icons.UserCircle} class="h-6 w-6" />
        </div>
        <div>caiiiycuk@gmail.com</div>
        <div class="h-6 w-6 ml-2">
            <${Icons.Logout} class="h-6 w-6" />
        </div>
    </div>
    `;
}
