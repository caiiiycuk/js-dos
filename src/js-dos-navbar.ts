import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { click, createDiv } from "./dom";
import { DosPlayerOptions } from "./js-dos-player";

const goneClass = "jsdos-player-gone";
const disabledClass = "jsdos-player-button-disabled";
const primaryClass ="jsdos-player-button-primary";

export class Navbar {

	root: HTMLDivElement;
	dos: DosInstance;

	constructor(root: HTMLDivElement, dos: DosInstance, options: DosPlayerOptions) {
		this.root = root;
		this.dos = dos;
		const title = options.title || "JS-DOS";

		const logoDiv = createDiv("jsdos-player-logo");
		const titleDiv = this.createTitle(title);
		const springDiv = createDiv("jsdos-player-spring");
		const fullscreenButtonDiv = this.createFullScreenButton();
		const saveButtonDiv = this.createSaveButton();
		const keyboardButtonDiv = this.createKeyboardButton();
		const muteButtonDiv = this.createMuteButton();
		const unmuteButtonDiv = this.createUnmuteButton();
		const stopButtonDiv = this.createStopButton();
		const playButtonDiv = this.createPlayButton();
		const mobileButtonDiv = this.createMobileButton();
		const dividerDiv = createDiv("jsdos-player-divider");

		this.root.appendChild(logoDiv);
		this.root.appendChild(titleDiv);
		this.root.appendChild(springDiv);
		this.root.appendChild(dividerDiv);
		this.root.appendChild(mobileButtonDiv);
		this.root.appendChild(playButtonDiv);
		this.root.appendChild(stopButtonDiv);
		this.root.appendChild(unmuteButtonDiv);
		this.root.appendChild(muteButtonDiv);
		this.root.appendChild(keyboardButtonDiv);
		this.root.appendChild(saveButtonDiv);
		this.root.appendChild(fullscreenButtonDiv);

		click(fullscreenButtonDiv, this.onFullscreen);
		click(saveButtonDiv, this.onSave);
		click(keyboardButtonDiv, this.onKeyboard);
		click(muteButtonDiv, (el) => this.onMute(el, unmuteButtonDiv));
		click(unmuteButtonDiv, (el) => this.onUnmute(el, muteButtonDiv));
		click(stopButtonDiv, (el) => this.onStop(el, playButtonDiv));
		click(playButtonDiv, (el) => this.onPlay(el, stopButtonDiv));
		click(mobileButtonDiv, this.onMobileControls);

		this.dos.layers.setOnSaveStarted(() => {
			saveButtonDiv.classList.add(disabledClass);
			titleDiv.innerText = "Saving...";
		});

		this.dos.layers.setOnSaveEnded(() => {
			saveButtonDiv.classList.remove(disabledClass);
			titleDiv.innerText = title;
		});

		this.dos.layers.setOnKeyboardVisibility((visible) => {
			if (visible) {
				keyboardButtonDiv.classList.add(primaryClass);
			} else {
				keyboardButtonDiv.classList.remove(primaryClass);
			}
		});

		this.dos.layers.setOnFullscreen((fullscreen) => {
			if (fullscreen) {
				this.root.classList.add(goneClass);
			} else {
				this.root.classList.remove(goneClass);
			}
		});

		const onMobileControlsChanged = (visible: boolean) => {
			if (visible) {
				mobileButtonDiv.classList.add(primaryClass);
			} else {
				mobileButtonDiv.classList.remove(primaryClass);
			}
		};
		this.dos.setOnMobileControlsChanged(onMobileControlsChanged);
		onMobileControlsChanged(this.dos.mobileControls);
	}

	onFullscreen = (): void => {
		this.dos.layers.toggleFullscreen();
	};

	onSave = (): void => {
		this.dos.layers.save();
	};

	onKeyboard = (): void => {
		this.dos.layers.toggleKeyboard();
	}

	onMute = (el: HTMLElement, unmute: HTMLElement): void => {
		this.dos.ciPromise?.then((ci) => {
			el.classList.add(goneClass);
			unmute.classList.remove(goneClass);
			ci.mute();
		});
	}

	onUnmute = (el: HTMLElement, mute: HTMLElement): void => {
		this.dos.ciPromise?.then((ci) => {
			el.classList.add(goneClass);
			mute.classList.remove(goneClass);
			ci.unmute();
		});
	}

	onPlay = (el: HTMLElement, stop: HTMLElement): void => {
		this.dos.ciPromise?.then((ci) => {
			el.classList.add(goneClass);
			stop.classList.remove(goneClass);
			ci.resume();
		});
	}

	onStop = (el: HTMLElement, play: HTMLElement): void => {
		this.dos.ciPromise?.then((ci) => {
			el.classList.add(goneClass);
			play.classList.remove(goneClass);
			ci.pause();
		});
	}

	onMobileControls = (): void => {
		if (this.dos.mobileControls) {
			this.dos.disableMobileControls();
		} else {
			this.dos.enableMobileControls();
		}
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

	private createSaveButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="save" class="jsdos-player-icon jsdos-player-icon-save">
				<svg data-icon="save" width="16" height="16" viewBox="0 0 16 16">
					<desc>save</desc>
					<path d="M15.71 2.29l-2-2A.997.997 0 0013 0h-1v6H4V0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V3c0-.28-.11-.53-.29-.71zM14 15H2V9c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v6zM11 1H9v4h2V1z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

	private createKeyboardButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="keyboard" class="jsdos-player-icon jsdos-player-icon-keyboard">
				<svg data-icon="keyboard" width="16" height="16" viewBox="0 0 16 16">
					<desc>keyboard</desc>
					<path d="M1 8h3.76l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm14.49-4.01c.31-.32.51-.76.51-1.24C16 1.78 15.22 1 14.25 1c-.48 0-.92.2-1.24.51l-1.44 1.44 2.47 2.47 1.45-1.43zM1 4h7.76l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm0 6c-.55 0-1 .45-1 1 0 .48.35.86.8.96L2.76 10H1zm9.95-6.43l-6.69 6.69 2.47 2.47 6.69-6.69-2.47-2.47zm4.25 2.47L13.24 8H15c.55 0 1-.45 1-1 0-.48-.35-.86-.8-.96zM2 15l3.86-1.39-2.46-2.44L2 15zm13-5h-3.76l-2 2H15c.55 0 1-.45 1-1s-.45-1-1-1z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

	private createMuteButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="mute" class="jsdos-player-icon jsdos-player-icon-mute">
				<svg data-icon="mute" width="16" height="16" viewBox="0 0 16 16">
					<desc>mute</desc>
					<path d="M7 1.86c-.28 0-.53.11-.71.29l-2.7 2.71H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.59l2.71 2.71a1.003 1.003 0 001.71-.71v-10c-.01-.55-.46-1-1.01-1zm6.74-.99l-1.58 1.22A9.985 9.985 0 0114 7.86c0 2.16-.69 4.15-1.85 5.78l1.58 1.22c1.42-1.97 2.26-4.38 2.26-7 .01-2.61-.84-5.02-2.25-6.99zM8.98 4.52C9.62 5.48 10 6.63 10 7.86s-.38 2.39-1.02 3.34l1.59 1.22c.9-1.29 1.43-2.86 1.43-4.56 0-1.7-.53-3.27-1.43-4.56L8.98 4.52z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

	private createUnmuteButton(): HTMLDivElement {
		return createDiv(["jsdos-player-button", goneClass], `
			<span icon="unmute" class="jsdos-player-icon jsdos-player-icon-unmute">
				<svg data-icon="unmute" width="16" height="16" viewBox="0 0 16 16">
					<desc>unmute</desc>
					<path d="M11 2c-.28 0-.53.11-.71.29L7.59 5H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

	private createStopButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="stop" class="jsdos-player-icon jsdos-player-icon-stop">
				<svg data-icon="stop" width="16" height="16" viewBox="0 0 16 16">
					<desc>stop</desc>
					<path d="M6 3H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm6 0h-2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

	private createPlayButton(): HTMLDivElement {
		return createDiv(["jsdos-player-button", goneClass], `
			<span icon="play" class="jsdos-player-icon jsdos-player-icon-play">
				<svg data-icon="play" width="16" height="16" viewBox="0 0 16 16">
					<desc>play</desc>
					<path d="M12 8c0-.35-.19-.64-.46-.82l.01-.02-6-4-.01.02A.969.969 0 005 3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1 .21 0 .39-.08.54-.18l.01.02 6-4-.01-.02c.27-.18.46-.47.46-.82z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}


	private createMobileButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="mobile" class="jsdos-player-icon jsdos-player-icon-mobile">
				<svg data-icon="mobile" width="16" height="16" viewBox="0 0 16 16">
					<desc>mobile</desc>
					<path d="M12 0H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM8 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-3H5V3h6v9z" fill-rule="evenodd">
					</path>
				</svg>
			</span>
		`)
	}

}