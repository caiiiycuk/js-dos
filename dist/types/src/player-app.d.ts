import "preact/debug";
import { ClientId, DosPlayer, DosPlayerOptions } from "./player";
export interface Props {
    player: () => DosPlayer;
    options: () => DosPlayerOptions;
    clientId: ClientId | null;
    setClientId: (clientId: ClientId | null) => void;
    requestClientId?: (userGesture: boolean) => Promise<ClientId | null>;
    mobileControls: boolean;
    setMobileControls: (controls: boolean) => void;
    mirroredControls: boolean;
    setMirroredControls: (mirrored: boolean) => void;
    keyboard: boolean;
    toggleKeyboard: () => void;
    fullscreen: boolean;
    toggleFullscreen: () => void;
    pause: boolean;
    setPause: (pause: boolean) => void;
    mute: boolean;
    setMute: (mute: boolean) => void;
    actionBar: boolean;
    setActionBar: (actionBar: boolean) => void;
    sideBar: boolean;
    openSideBar: () => void;
    closeSideBar: () => void;
}
export declare function PlayerApp(playerProps: {
    player: () => DosPlayer;
    options: () => DosPlayerOptions;
}): import("preact").VNode<any> | import("preact").VNode<any>[];
export declare function createPlayerApp(root: HTMLDivElement, player: DosPlayer, options: DosPlayerOptions): void;
