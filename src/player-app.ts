
import "preact/debug";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from "./dom";

import { ActionButton } from "./components/action-button";
import { SideBar } from "./components/sidebar";
import { ClientId, DosPlayer, DosPlayerOptions } from "./player";

export interface Props {
    player: () => DosPlayer;
    options: () => DosPlayerOptions;

    clientId: ClientId | null,
    setClientId: (clientId: ClientId | null) => void,

    keyboard: boolean;
    toggleKeyboard: () => void;

    sideBar: boolean;
    openSideBar: () => void;
    closeSideBar: () => void;
}

export function PlayerApp(playerProps: {
    player: () => DosPlayer,
    options: () => DosPlayerOptions,
}) {
    const [clientId, setClientId] = useState<ClientId | null>(null);
    const [sideBar, setSideBar] = useState<boolean>(true);
    const [keyboard, setKeyboard] = useState<boolean>(playerProps.player().layers.keyboardVisible);

    const props: Props = {
        player: playerProps.player,
        options: playerProps.options,

        clientId,
        setClientId,

        keyboard,
        toggleKeyboard: () => {
            playerProps.player().layers.toggleKeyboard();
            setKeyboard(playerProps.player().layers.keyboardVisible);
        },

        sideBar,
        openSideBar: () => setSideBar(true),
        closeSideBar: () => setSideBar(false),
    };

    return html`
    <div>
        <${ActionButton} ...${props} />
        <${SideBar} ...${props} />
    </div>
    `;
}

export function createPlayerApp(root: HTMLDivElement,
                                player: DosPlayer,
                                options: DosPlayerOptions) {
    render(html`<${PlayerApp} player=${() => player} options=${() => options} />`, root);
}
