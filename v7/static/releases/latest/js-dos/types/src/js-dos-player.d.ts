import { DosInstance, DosOptions } from "emulators-ui/dist/types/js-dos";
import { Navbar } from "./js-dos-navbar";
import { Hardware } from "./hardware-transport-layer";
import { Settings } from "./js-dos-settings";
export interface ClientId {
    namespace: string;
    id: string;
}
export declare type ClientIdSupplier = (userGesture: boolean) => Promise<ClientId | null>;
export interface DosPlayerOptions extends DosOptions {
    title?: string;
    style?: "default" | "dark" | "none";
    hardware?: Hardware;
    clientId?: ClientIdSupplier;
}
export interface DosPlayer extends DosInstance {
    navbar: Navbar;
    settings: Settings;
    requestClientId(userGesture: boolean): Promise<ClientId | null>;
    bundleUrl: string | null;
}
export declare type DosPlayerFactoryType = (root: HTMLDivElement, options?: DosPlayerOptions) => DosPlayer;
export declare function DosPlayer(root: HTMLDivElement, options?: DosPlayerOptions): DosPlayer;
