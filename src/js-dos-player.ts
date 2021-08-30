import { DosInstance, DosFactoryType, DosOptions } from "emulators-ui/dist/types/js-dos";
import { Navbar } from "./js-dos-navbar";
import { createDiv } from "./dom";

declare const Dos: DosFactoryType;

const dosImpl = Dos;

export interface DosPlayerOptions extends DosOptions {
	title?: string;
	dark?: boolean;
}

export interface DosPlayer extends DosInstance {
	navbar: Navbar;
}

export function DosPlayer(root: HTMLDivElement, options?: DosPlayerOptions): DosPlayer {
	options = options || {};

	if (options.dark) {
		root.classList.add("jsdos-player-dark");
	}

	root.classList.add("jsdos-player-root");

	const navbar = createDiv("jsdos-navbar");
	const window = createDiv("jsdos-window");

	root.appendChild(navbar);
	root.appendChild(window)

	const player = dosImpl(window, options || {}) as DosPlayer;
	player.navbar = new Navbar(navbar, options);
	return player;
}

(window as any).Dos = DosPlayer;