import { DosInstance, DosFactoryType, DosOptions } from "emulators-ui/dist/types/js-dos";
import { Navbar } from "./js-dos-navbar";
import { createDiv } from "./dom";
import { Hardware, hardwareTransportLayerFactory } from "./hardware-transport-layer";
import { Settings } from "./js-dos-settings";
import { getPersonalBundleUrl, putPersonalBundle } from "./js-dos-personal";

declare const Dos: DosFactoryType;

const dosImpl = Dos;

export interface ClientId {
	namespace: string;
	id: string;
}

export type ClientIdSupplier = (userGesture: boolean) => Promise<ClientId | null>;

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
}

export declare type DosPlayerFactoryType = (root: HTMLDivElement, options?: DosPlayerOptions) => DosPlayer;

export function DosPlayer(root: HTMLDivElement, options?: DosPlayerOptions): DosPlayer {
	options = options || {};

	if (options.style === "none") {
		console.warn("If you don't need the jsdos topbar, please use emulatros + emulators-ui instead");
		return dosImpl(root, options || {}) as DosPlayer;
	}

	if (options.style === "dark") {
		root.classList.add("jsdos-player-dark");
	}

	root.classList.add("jsdos-player-root");

	const navbar = createDiv("jsdos-player-navbar");
	const window = createDiv("jsdos-player-window");
	const settings = createDiv("jsdos-player-settings");
	const keyboard = createDiv("jsdos-player-keyboard");

	root.appendChild(navbar);
	root.appendChild(window);
	root.appendChild(settings);
	root.appendChild(keyboard);

	options.layersOptions = options.layersOptions || {};
	options.layersOptions.keyboardDiv = keyboard;
	options.layersOptions.fullscreenElement = root;

	const hardware = options.hardware;
	if (hardware !== undefined && hardware !== null) {
		options.createTransportLayer = () => {
			return hardwareTransportLayerFactory.createTransportLayer(hardware);
		};
		options.emulatorFunction = "backend";
	}

	const player = dosImpl(window, options) as DosPlayer;
	player.navbar = new Navbar(navbar, player, options);
	player.settings = new Settings(settings, player, options);
	player.requestClientId = async (userGesture: boolean) => {
		if (options?.clientId === undefined) {
			return null;
		}

		const clientId = await options.clientId(userGesture);
		clientId === null ? player.navbar.showWarn() : player.navbar.hideWarn();
		player.settings.updateClientId(clientId);
		return clientId;
	}

	const runFn = player.run;
	player.run = async (bundleUrl: string, optionalChangesUrl?: string, optionalPersistKey?: string) => {
		const clientId = await player.requestClientId(false);
		if (optionalChangesUrl === undefined && optionalPersistKey === undefined && clientId !== null) {
			optionalChangesUrl = getPersonalBundleUrl(clientId.namespace, clientId.id, bundleUrl) + "?dt=" + Date.now();
		}

		const ci = await runFn.call(player, bundleUrl, optionalChangesUrl, optionalPersistKey);

		const saveFn = player.layers.getOnSave();
		player.layers.setOnSave(async () => {
			const clientId = await player.requestClientId(false);
			if (clientId !== null) {
				const data = await ci.persist();
				return putPersonalBundle(clientId.namespace, clientId.id, bundleUrl, data);
			} else {
				return saveFn.call(player.layers);
			}
		});

		return ci;
	};

	player.requestClientId(false);

	return player;
}

// eslint-disable-next-line
(window as any).Dos = DosPlayer;