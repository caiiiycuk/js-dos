import { DosInstance, DosFactoryType, DosOptions } from "emulators-ui/dist/types/js-dos";
import { Navbar } from "./js-dos-navbar";
import { createDiv } from "./dom";

declare const Dos: DosFactoryType;

const dosImpl = Dos;

export interface DosPlayerOptions extends DosOptions {
	title?: string;
	style?: "default" | "dark" | "none";
}

export interface DosPlayer extends DosInstance {
	navbar: Navbar;
}

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
	const keyboard = createDiv("jsdos-player-keyboard");

	root.appendChild(navbar);
	root.appendChild(window);
	root.appendChild(keyboard);

	options.layersOptions = options.layersOptions || {};
	options.layersOptions.keyboardDiv = keyboard;
	options.layersOptions.fullscreenElement = root;

	const player = dosImpl(window, options || {}) as DosPlayer;
	player.navbar = new Navbar(navbar, player, options);

	return player;
}

(window as any).Dos = DosPlayer;