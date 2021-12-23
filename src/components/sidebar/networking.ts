import { html } from "../../dom";

import { Props } from "../../player-app";
import { ActiveToken } from "./active-token";
import { CreateToken } from "./create-token";

export function Networking(props: Props) {
    if (props.sideBarPage !== "networking") {
        return null;
    }

    return html`
        <${ActiveToken} ...${props} />
        ${props.showNewInstance ? html`<${CreateToken} ...${props} />` : null }
    `;
}
