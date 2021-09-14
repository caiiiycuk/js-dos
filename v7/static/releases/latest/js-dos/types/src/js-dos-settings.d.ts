import { ClientId, DosPlayer, DosPlayerOptions } from "./js-dos-player";
export declare class Settings {
    root: HTMLDivElement;
    dos: DosPlayer;
    updateClientId: (clientId: ClientId | null) => void;
    constructor(root: HTMLDivElement, dos: DosPlayer, options: DosPlayerOptions);
    onClientIdLogin: () => void;
    show(): void;
    hide(): void;
    onDownload: (el: HTMLElement) => Promise<void>;
    onUpload: (el: HTMLDivElement, input: HTMLInputElement) => Promise<void>;
    private createLoginButton;
    private createDownloadButton;
    private createUploadButton;
    private createUploadInput;
}
