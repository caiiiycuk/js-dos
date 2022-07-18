import { DosInstance, DosFactoryType, DosOptions } from "emulators-ui/dist/types/js-dos";
import { createDiv } from "./dom";
import { Hardware, hardwareTransportLayerFactory } from "./hardware-transport-layer";
import { getPersonalBundleUrl, putPersonalBundle } from "./backend/v7/personal";

import { createPlayerApp } from "./player-app";

declare const Dos: DosFactoryType;

const dosImpl = Dos;

export interface ClientId {
    namespace: string;
    id: string;
}

export type ClientIdSupplier = (userGesture: boolean) => Promise<ClientId | null>;

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

export function DosPlayer(root: HTMLDivElement, optOptions?: DosPlayerOptions): DosPlayer {
    const options = (optOptions || {}) as DosPlayerOptionsWithDefaults;

    if (options.windowOpen === undefined) {
        if (typeof window === "object") {
            options.windowOpen = window.open.bind(window);
        } else {
            options.windowOpen = () => {
                throw new Error("window.open is not defined");
            };
        }
    }

    if (options.style === "none") {
        console.warn("If you don't need the jsdos services, please use emulatros + emulators-ui instead");
        return dosImpl(root, options) as DosPlayer;
    }

    root.classList.add("flex");
    root.classList.add("flex-row");
    root.classList.add("relative");
    root.classList.add("overflow-hidden");

    const modal = createDiv(["hidden", "flex-col", "absolute", "left-0", "top-0",
        "bottom-0", "right-0", "items-center", "justify-center", "z-50",
        "bg-gray-800", "opacity-95"]);
    const modalText = createDiv(["text-2xl", "font-bold", "font-mono", "animate-pulse",
        "text-green-600"]);
    modal.appendChild(modalText);

    const col = createDiv(["flex", "flex-col", "flex-grow", "overflow-hidden"]);
    const frame = createDiv("flex-grow");
    const appRoot = createDiv("flex-grow-0");
    const keyboard = createDiv("flex-grow-0");
    const keyboardInput = root;

    col.appendChild(frame);
    col.appendChild(keyboard);

    root.appendChild(appRoot);
    root.appendChild(col);
    root.appendChild(modal);

    function showModal(text: string) {
        modalText.innerHTML = text;
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    }

    function hideModal() {
        modal.classList.remove("flex");
        modal.classList.add("hidden");
    }

    options.layersOptions = options.layersOptions || {};
    options.layersOptions.keyboardDiv = keyboard;
    options.layersOptions.keyboardInputDiv = keyboardInput;
    options.layersOptions.fullscreenElement = root;
    options.layersOptions.optionControls = [];

    const hardware = options.hardware;
    if (hardware !== undefined && hardware !== null) {
        options.createTransportLayer = () => {
            return hardwareTransportLayerFactory.createTransportLayer(hardware);
        };
        options.emulatorFunction = "backend";
    }


    const player = dosImpl(frame, options) as DosPlayer;
    let onRun = () => { };
    const setOnRun = (newOnRun: () => void) => onRun = newOnRun;
    createPlayerApp(appRoot, player, options, setOnRun);

    player.bundleUrl = null;

    const runFn = player.run;
    player.run = async (bundleUrl: string, optionalChangesUrl?: string, optionalPersistKey?: string) => {
        hideModal();

        const getClientId = () => options?.clientId !== undefined ? options.clientId(false) : null;
        const clientId = await getClientId();
        if (optionalChangesUrl === undefined && optionalPersistKey === undefined && clientId !== null) {
            optionalChangesUrl = getPersonalBundleUrl(clientId.namespace, clientId.id, bundleUrl) + "?dt=" + Date.now();
        }

        const ci = await runFn.call(player, bundleUrl, optionalChangesUrl, optionalPersistKey);
        player.bundleUrl = bundleUrl;

        const saveFn = player.layers.getOnSave();
        player.layers.setOnSave(async () => {
            const closeOnSave = typeof options?.onExit === "function";
            const showModals = closeOnSave;

            if (closeOnSave) {
                ci.mute();
            }

            const clientId = await getClientId();

            if (clientId !== null) {
                if (showModals) {
                    showModal("Saving [1/2]: collecting changes");
                }

                const data = await ci.persist();

                if (showModals) {
                    showModal("Saving [2/2]: sending to cloud");
                }

                await putPersonalBundle(clientId.namespace, clientId.id, bundleUrl, data);
            } else {
                if (showModals) {
                    showModal("Saving [1/1]: collecting changes");
                }

                await saveFn.call(player.layers);
            }

            if (closeOnSave && showModals) {
                showModal("Saved. Now you can close the window");
                modalText.classList.remove("animate-pulse");
            }
        });

        onRun();
        return ci;
    };

    const stopFn = player.stop;
    player.stop = () => {
        player.bundleUrl = null;
        return stopFn.call(player);
    };

    return player;
}

// eslint-disable-next-line
(window as any).Dos = DosPlayer;