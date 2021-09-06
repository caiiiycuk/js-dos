import { click, createDiv, goneClass, primaryClass } from "./dom";
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

		this.root.appendChild(clientIdHeader);
		this.root.appendChild(clientIdRow);
		this.root.appendChild(clientIdInfo);

		clientIdRow.appendChild(clientIdText);
		clientIdRow.appendChild(clientIdLogin);

		click(clientIdLogin, this.onClientIdLogin);

		this.updateClientId = (clientId) => {
			if (clientId === null) {
				clientIdLogin.classList.remove(goneClass);
				clientIdText.classList.add("jsdos-player-color-warn");
				clientIdText.innerText = "!!! NOT-SET !!!";
			} else {
				clientIdLogin.classList.add(goneClass);
				clientIdText.classList.remove("jsdos-player-color-warn");
				clientIdText.innerText = clientId.id + "@" + clientId.namespace;
			}
		}
	}

	onClientIdLogin = (): void => {
		this.dos.requestClientId(true);
	}

	show() {
		this.root.classList.remove(goneClass);
	}

	hide() {
		this.root.classList.add(goneClass);
	}

	private createLoginButton(): HTMLDivElement {
		return createDiv(["jsdos-player-button", primaryClass], `
			<span icon="login" class="jsdos-player-icon jsdos-player-icon-login">
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
}