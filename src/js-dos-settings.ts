import { click, createDiv, disabledClass, downloadFile, goneClass } from "./dom";
import { putPersonalBundle } from "./js-dos-personal";
import { ClientId, DosPlayer, DosPlayerOptions } from "./js-dos-player";

export class Settings {
	root: HTMLDivElement;
	dos: DosPlayer;
	updateClientId: (clientId: ClientId | null) => void;

	constructor(root: HTMLDivElement, dos: DosPlayer, options: DosPlayerOptions) {
		this.root = root;
		this.dos = dos;
		this.root.classList.add(goneClass);

		const clientIdHeader = document.createElement("h2");
		clientIdHeader.innerText = "ClientId";

		const clientIdRow = createDiv("jsdos-player-client-id-row");
		const clientIdInfo = createDiv("jsdos-player-client-id-info", `
			By default js-dos store your game progress in indexed db. This data can be suddenly wiped. Please log-in to store progress on backend, and
			activate all other features.
		`);
		const clientIdLogin = this.createLoginButton();
		const clientIdText = createDiv("jsdos-player-client-id");
		const download = this.createDownloadButton();
		const divider = createDiv("jsdos-player-divider");
		const uploadRow = createDiv("jsdos-player-upload-row");
		const upload = this.createUploadButton();
		const uploadInput = this.createUploadInput();

		this.root.appendChild(clientIdHeader);
		this.root.appendChild(clientIdRow);
		this.root.appendChild(clientIdInfo);

		clientIdRow.appendChild(clientIdLogin);
		clientIdRow.appendChild(clientIdText);
		clientIdRow.appendChild(download);
		clientIdRow.appendChild(divider);
		clientIdRow.appendChild(uploadRow);

		uploadRow.appendChild(upload);
		uploadRow.appendChild(uploadInput);

		click(clientIdLogin, this.onClientIdLogin);
		click(clientIdText, this.onClientIdLogin);
		click(download, this.onDownload);
		click(upload, () => this.onUpload(upload, uploadInput));

		this.updateClientId = (clientId) => {
			if (clientId === null) {
				clientIdLogin.classList.remove(goneClass);
				clientIdLogin.classList.add("jsdos-player-color-warn");
				clientIdText.classList.add("jsdos-player-color-warn");
				clientIdText.innerText = "Log in";
				download.classList.add(goneClass);
				divider.classList.add(goneClass);
				upload.classList.add(goneClass);
				uploadInput.classList.add(goneClass);
			} else {
				clientIdLogin.classList.add(goneClass);
				clientIdText.classList.remove("jsdos-player-color-warn");
				clientIdText.innerText = clientId.id + "@" + clientId.namespace;
				download.classList.remove(goneClass);
				divider.classList.remove(goneClass);
				upload.classList.remove(goneClass);
				uploadInput.classList.remove(goneClass);
			}
		}
	}

	onClientIdLogin = (): void => {
		this.dos.requestClientId(true);
	}

	show(): void {
		this.root.classList.remove(goneClass);
	}

	hide(): void {
		this.root.classList.add(goneClass);
	}

	onDownload = async (el: HTMLElement): Promise<void> => {
		if (!this.dos.ciPromise) {
			return;
		}

		el.classList.add(disabledClass);
		try {
			const ci = await this.dos.ciPromise;
			const changes = await ci.persist();
			downloadFile(changes, "saves.zip", "application/zip");
		} finally {
			el.classList.remove(disabledClass);
		}
	}

	onUpload = async (el: HTMLDivElement, input: HTMLInputElement): Promise<void> => {
		const bundleUrl = this.dos.bundleUrl;
		const files = input.files;
		if (bundleUrl === null || files === null || files.length !== 1) {
			return;
		}

		const file = files[0];

		el.classList.add(disabledClass);
		try {
			const data = new Uint8Array(await file.arrayBuffer());
			const clientId = await this.dos.requestClientId(false);
			if (clientId === null) {
				return;
			}

			if (data.length > 5 * 1024 * 1024) {
				alert("File is too big");
				return;
			}

			await putPersonalBundle(clientId.namespace, clientId.id, bundleUrl, data);
			alert("Uploaded");
		} finally {
			el.classList.remove(disabledClass);
		}
	}

	private createLoginButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="login" class="jsdos-player-icon jsdos-player-icon-login jsdos-player-icon-warn">
				<svg data-icon="settings" width="16" height="16" viewBox="0 0 16 16">
					<desc>login</desc>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M11,8c0-0.28-0.11-0.53-0.29-0.71l-3-3C7.53,4.11,7.28,4,7,4C6.45,4,6,4.45,6,5
						c0,0.28,0.11,0.53,0.29,0.71L7.59,7H1C0.45,7,0,7.45,0,8c0,0.55,0.45,1,1,1h6.59l-1.29,1.29C6.11,10.47,6,10.72,6,11
						c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l3-3C10.89,8.53,11,8.28,11,8z M15,0H9C8.45,0,8,0.45,8,1c0,0.55,0.45,1,1,1h5v12H9
						c-0.55,0-1,0.45-1,1c0,0.55,0.45,1,1,1h6c0.55,0,1-0.45,1-1V1C16,0.45,15.55,0,15,0z"/>
				</svg>
			</span>
		`)
	}

	private createDownloadButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="download" class="jsdos-player-icon jsdos-player-icon-download">
				<svg data-icon="download" width="16" height="16" viewBox="0 0 16 16">
					<desc>download</desc>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M11,11c-0.28,0-0.53,0.11-0.71,0.29L9,12.59V8c0-0.55-0.45-1-1-1S7,7.45,7,8
						v4.59l-1.29-1.29C5.53,11.11,5.28,11,5,11c-0.55,0-1,0.45-1,1c0,0.28,0.11,0.53,0.29,0.71l3,3C7.47,15.89,7.72,16,8,16
						s0.53-0.11,0.71-0.29l3-3C11.89,12.53,12,12.28,12,12C12,11.45,11.55,11,11,11z M12,4c-0.03,0-0.07,0-0.1,0.01
						C11.44,1.72,9.42,0,7,0C4.24,0,2,2.24,2,5c0,0.11,0.01,0.22,0.02,0.33C0.83,5.89,0,7.1,0,8.5c0,1.41,0.84,2.61,2.03,3.17
						C2.2,10.17,3.46,9,5,9c0.06,0,0.13,0.02,0.19,0.02C5.07,8.7,5,8.36,5,8c0-1.66,1.34-3,3-3s3,1.34,3,3c0,0.36-0.07,0.7-0.19,1.02
						C10.87,9.02,10.94,9,11,9c1.48,0,2.7,1.07,2.95,2.47C15.17,10.79,16,9.5,16,8C16,5.79,14.21,4,12,4z"/>
				</svg>
			</span>
		`)
	}

	private createUploadButton(): HTMLDivElement {
		return createDiv("jsdos-player-button", `
			<span icon="upload" class="jsdos-player-icon jsdos-player-icon-upload">
				<svg data-icon="upload" width="16" height="16" viewBox="0 0 16 16">
					<desc>upload</desc>
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8.71,7.29C8.53,7.11,8.28,7,8,7S7.47,7.11,7.29,7.29l-3,3
						C4.11,10.47,4,10.72,4,11c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29L7,10.41V15c0,0.55,0.45,1,1,1s1-0.45,1-1v-4.59l1.29,1.29
						C10.47,11.89,10.72,12,11,12c0.55,0,1-0.45,1-1c0-0.28-0.11-0.53-0.29-0.71L8.71,7.29z M12,4c-0.03,0-0.07,0-0.1,0.01
						C11.44,1.72,9.42,0,7,0C4.24,0,2,2.24,2,5c0,0.11,0.01,0.22,0.02,0.33C0.83,5.89,0,7.1,0,8.5c0,1.43,0.86,2.66,2.09,3.2
						C2.04,11.47,2,11.24,2,11c0-0.83,0.34-1.58,0.88-2.12l3-3C6.42,5.34,7.17,5,8,5s1.58,0.34,2.12,0.88l3,3
						C13.66,9.42,14,10.17,14,11c0,0.16-0.02,0.32-0.05,0.47C15.17,10.78,16,9.5,16,8C16,5.79,14.21,4,12,4z"/>
				</svg>
			</span>
		`)
	}

	private createUploadInput(): HTMLInputElement {
		const input = document.createElement("input");
		input.classList.add("jsdos-upload-file");
		input.type = "file";
		return input;
	}
}