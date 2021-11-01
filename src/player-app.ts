
import "preact/debug";
import { render } from "preact";
import { useEffect, useState } from "preact/hooks";
import { html } from "./dom";

import { ActionHide } from "./components/action-hide";
import { ActionBar } from "./components/action-bar";
import { ActionExit } from "./components/action-exit";
import { SideBar } from "./components/sidebar";
import { ClientId, DosPlayer, DosPlayerOptions } from "./player";

export interface Props {
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
    const [clientId, setClientId] = useState<ClientId | null>(null);
    const [sideBar, setSideBar] = useState<boolean>(false);
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
            const newFullscreen = document.fullscreenElement !== null;
            setFullscreen(newFullscreen);
            if (!newFullscreen) {
                setActionBar(true);
            }
        };

        document.addEventListener("fullscreenchange", listener);

        return () => {
            document.removeEventListener("fullscreenchange", listener);
        };
    }, [fullscreen, setFullscreen]);

    const props: Props = {
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
        <${ActionHide} ...${props} />
        <${SideBar} ...${props} />
        <${ActionBar} ...${props} />
        <${ActionExit} ...${props} />
    </div>
    `;
}

export function createPlayerApp(root: HTMLDivElement,
    player: DosPlayer,
    options: DosPlayerOptions) {
    render(html`<${PlayerApp} player=${() => player} options=${() => options} />`, root);
}
