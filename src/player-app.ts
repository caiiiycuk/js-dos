
import "preact/debug";
import { render } from "preact";
import { useState } from "preact/hooks";
import { html } from "./dom";

import { ActionButton } from "./components/action-button";
import { SideBar } from "./components/sidebar";

export interface Props {
    sideBar: boolean;

    openSideBar: () => void;
    closeSideBar: () => void;
}

export function PlayerApp(_: {}) {
    const [sideBar, setSideBar] = useState<boolean>(true);

    const props: Props = {
        sideBar,
        openSideBar: () => setSideBar(true),
        closeSideBar: () => setSideBar(false),
    };

    return html`
    <div class="jsdos-player-app-root absolute left-0 bottom-0 right-0 top-0">
        <${ActionButton} ...${props} />
        <${SideBar} ...${props} />
    </div>
    `;
}

export function createPlayerApp(root: HTMLDivElement) {
    return render(html`<${PlayerApp} />`, root);
}
