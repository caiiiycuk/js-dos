
import "preact/debug";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from "./dom";

import { ActionButton } from "./components/action-button";
import { ActionBar } from "./components/action-bar";
import { SideBar } from "./components/sidebar";
import { ClientId, DosPlayer, DosPlayerOptions } from "./player";

export interface Props {
    portrait: boolean;
    player: () => DosPlayer;
    options: () => DosPlayerOptions;

    clientId: ClientId | null,
    setClientId: (clientId: ClientId | null) => void,
    requestClientId?: (userGesture: boolean) => Promise<ClientId | null>,

    mobileControls: boolean;
    setMobileControls: (controls: boolean) => void;

    keyboard: boolean;
    toggleKeyboard: () => void;

    fullscreen: boolean;
    toggleFullscreen: () => void;

    pause: boolean;
    setPause: (pause: boolean) => void;

    mute: boolean;
    setMute: (mute: boolean) => void;

    actionBar: boolean;
    setActionBar: (actionBar: boolean) => void

    sideBar: boolean;
    openSideBar: () => void;
    closeSideBar: () => void;
}

export function PlayerApp(playerProps: {
    player: () => DosPlayer,
    options: () => DosPlayerOptions,
}) {
    const requestClientIdFn = playerProps.options().clientId;
    const requestClientId = typeof requestClientIdFn === "function" ?
        (userGesture: boolean) => requestClientIdFn(userGesture) :
        undefined;
    const [portrait, setPortrait] = useState<boolean>(isPortrait());
    const [clientId, setClientId] = useState<ClientId | null>(null);
    const [sideBar, setSideBar] = useState<boolean>(true);
    const [mobileControls, setMobileControls] = useState<boolean>(playerProps.player().mobileControls);
    const [keyboard, setKeyboard] = useState<boolean>(playerProps.player().layers.keyboardVisible);
    const [pause, setPause] = useState<boolean>(false);
    const [mute, setMute] = useState<boolean>(false);
    const [fullscreen, setFullscreen] = useState<boolean>(playerProps.player().layers.fullscreen);
    const [actionBar, setActionBar] = useState<boolean>(true);

    useEffect(() => {
        if (typeof requestClientId !== "undefined") {
            requestClientId(false).then(setClientId).catch(console.error);
        }
    }, [requestClientIdFn, setClientId]);

    useEffect(() => {
        const listener = () => {
            const newValue = isPortrait();
            if (newValue !== portrait) {
                setPortrait(newValue);
            }
        };

        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [portrait, setPortrait]);

    const props: Props = {
        portrait,
        player: playerProps.player,
        options: playerProps.options,

        clientId,
        setClientId,
        requestClientId,

        mobileControls,
        setMobileControls: (controls: boolean) => {
            controls ?
                playerProps.player().enableMobileControls() :
                playerProps.player().disableMobileControls();
            setMobileControls(controls);
        },

        keyboard,
        toggleKeyboard: () => {
            setKeyboard(!playerProps.player().layers.keyboardVisible);
            playerProps.player().layers.toggleKeyboard();
        },

        fullscreen,
        toggleFullscreen: () => {
            const newFullscreen = !playerProps.player().layers.fullscreen;
            setFullscreen(newFullscreen);
            if (!newFullscreen) {
                setActionBar(true);
            } else if (!mobileControls) {
                setActionBar(false);
            }
            playerProps.player().layers.toggleFullscreen();
        },

        pause,
        setPause: (pause: boolean) => {
            playerProps.player().ciPromise?.then((ci) => {
                pause ? ci.pause() : ci.resume();
                setPause(pause);
            }).catch(console.error);
        },

        mute,
        setMute: (mute: boolean) => {
            playerProps.player().ciPromise?.then((ci) => {
                mute ? ci.mute() : ci.unmute();
                setMute(mute);
            }).catch(console.error);
        },

        actionBar,
        setActionBar,

        sideBar,
        openSideBar: () => setSideBar(true),
        closeSideBar: () => setSideBar(false),
    };

    return html`
    <div class="h-full">
        <${ActionButton} ...${props} />
        <${SideBar} ...${props} />
        <${ActionBar} ...${props} />
    </div>
    `;
}

export function createPlayerApp(root: HTMLDivElement,
                                player: DosPlayer,
                                options: DosPlayerOptions) {
    render(html`<${PlayerApp} player=${()=> player} options=${() => options} />`, root);
}


function isPortrait() {
    return window.innerWidth / window.innerHeight < 1.6;
}

function requestClientId(options: DosPlayerOptions, userGesture: boolean) {
    if (typeof options.clientId !== "function") {
        return Promise.resolve(null);
    }

    return options.clientId(userGesture);
}
