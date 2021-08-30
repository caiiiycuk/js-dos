import { createDiv } from "./dom";
import { DosPlayerOptions } from "./js-dos-player";

export class Navbar {

	root: HTMLDivElement;

	constructor(root: HTMLDivElement, options: DosPlayerOptions) {
		this.root = root;

		const titleDiv = this.createTitle(options.title || "JS-DOS");
		const springDiv = createDiv("jsdos-player-spring");
		const fullscreenButtonDiv = this.createFullScreenButton();

		this.root.appendChild(titleDiv);
		this.root.appendChild(springDiv);
		this.root.appendChild(fullscreenButtonDiv);
	}

	private createTitle(title: string): HTMLDivElement {
		return createDiv("jsdos-player-title", title);
	}
	
	private createFullScreenButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="maximize" class="jsdos-player-icon jsdos-player-icon-maximize">
				<svg data-icon="maximize" width="16" height="16" viewBox="0 0 16 16">
					<desc>maximize</desc>
					<path d="M5.99 8.99c-.28 0-.53.11-.71.29l-3.29 3.29v-1.59c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.41L6.7 10.7a1.003 1.003 0 00-.71-1.71zm9-9h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.3a.99.99 0 00-.29.7 1.003 1.003 0 001.71.71l3.29-3.29V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.56-.45-1.01-1-1.01z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

}