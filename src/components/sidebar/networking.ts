import { html } from "../../dom";

import { Props } from "../../player-app";
import { TokenConfiguration } from "./token/token";

export function Networking(props: Props) {
    if (props.sideBarPage !== "networking") {
        return null;
    }

    return html`
        <${TokenConfiguration} ...${props} />
    `;
}
