import { DosInstance, DosFactoryType, DosOptions } from "emulators-ui/dist/types/js-dos";
import { createDiv } from "./dom";
import { Hardware, hardwareTransportLayerFactory } from "./hardware-transport-layer";
import { getPersonalBundleUrl, putPersonalBundle } from "./personal";

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
    title?: string;
    style?: "default" | "none";
    hardware?: Hardware;
    clientId?: ClientIdSupplier;
}

export declare type DosPlayerFactoryType = (root: HTMLDivElement, options?: DosPlayerOptions) => DosPlayer;

export function DosPlayer(root: HTMLDivElement, options?: DosPlayerOptions): DosPlayer {
    options = options || {};

    if (options.style === "none") {
        console.warn("If you don't need the jsdos services, please use emulatros + emulators-ui instead");
        return dosImpl(root, options || {}) as DosPlayer;
    }

    root.classList.add("flex");
    root.classList.add("flex-row");
    root.classList.add("relative");
    root.classList.add("overflow-hidden");

    const col = createDiv(["flex", "flex-col", "flex-grow", "overflow-hidden"]);
    const window = createDiv("flex-grow");
    const appRoot = createDiv("flex-grow-0");
    const keyboard = createDiv("flex-grow-0");

    col.appendChild(window);
    col.appendChild(keyboard);

    root.appendChild(appRoot);
    root.appendChild(col);

    options.layersOptions = options.layersOptions || {};
    options.layersOptions.keyboardDiv = keyboard;
    options.layersOptions.fullscreenElement = root;
    options.layersOptions.optionControls = [];

    const hardware = options.hardware;
    if (hardware !== undefined && hardware !== null) {
        options.createTransportLayer = () => {
            return hardwareTransportLayerFactory.createTransportLayer(hardware);
        };
        options.emulatorFunction = "backend";
    }


    const player = dosImpl(window, options) as DosPlayer;
    createPlayerApp(appRoot, player, options);

    player.bundleUrl = null;

    const runFn = player.run;
    player.run = async (bundleUrl: string, optionalChangesUrl?: string, optionalPersistKey?: string) => {
        const getClientId = () => options?.clientId !== undefined ? options.clientId(false) : null;
        const clientId = await getClientId();
        if (optionalChangesUrl === undefined && optionalPersistKey === undefined && clientId !== null) {
            optionalChangesUrl = getPersonalBundleUrl(clientId.namespace, clientId.id, bundleUrl) + "?dt=" + Date.now();
        }

        const ci = await runFn.call(player, bundleUrl, optionalChangesUrl, optionalPersistKey);
        player.bundleUrl = bundleUrl;

        const saveFn = player.layers.getOnSave();
        player.layers.setOnSave(async () => {
            const clientId = await getClientId();
            if (clientId !== null) {
                const data = await ci.persist();
                return putPersonalBundle(clientId.namespace, clientId.id, bundleUrl, data);
            } else {
                return saveFn.call(player.layers);
            }
        });

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