import { DosInstance, DosOptions } from "emulators-ui/dist/types/js-dos";
import { Hardware } from "./hardware-transport-layer";
export interface ClientId {
    namespace: string;
    id: string;
}
export declare type ClientIdSupplier = (userGesture: boolean) => Promise<ClientId | null>;
export interface DosPlayer extends DosInstance {
    bundleUrl: string | null;
}
export interface DosPlayerOptions extends DosOptions {
    style?: "default" | "none" | "hidden";
    hardware?: Hardware;
    clientId?: ClientIdSupplier;
    onBeforeExit?: () => Promise<void>;
    onExit?: () => void;
    noSideBar?: boolean;
    noFullscreen?: boolean;
    noSocialLinks?: boolean;
    preventUnload?: boolean;
    withNetworkingApi?: boolean;
    withExperimentalApi?: boolean;
    windowOpen?: (url: string, target: string) => void;
}
export interface DosPlayerOptionsWithDefaults extends DosPlayerOptions {
    windowOpen: (url: string, target?: string) => void;
}
export declare type DosPlayerFactoryType = (root: HTMLDivElement, options?: DosPlayerOptions) => DosPlayer;
export declare function DosPlayer(root: HTMLDivElement, optOptions?: DosPlayerOptions): DosPlayer;
