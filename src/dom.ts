import { EmulatorsUi } from "emulators-ui";
import { h } from "preact";
import htm from "htm";

export const html = htm.bind(h);

export const goneClass = "jsdos-player-gone";
export const disabledClass = "jsdos-player-button-disabled";
export const primaryClass = "jsdos-player-button-primary";
export const activeClass = "jsdos-player-button-active";

declare const emulatorsUi: EmulatorsUi;

export function createDiv(className: string | string[], innerHtml?: string): HTMLDivElement {
    const el = document.createElement("div");
    if (typeof className === "string") {
        el.className = className;
    } else {
        for (const next of className) {
            el.classList.add(next);
        }
    }
    if (innerHtml !== undefined) {
        el.innerHTML = innerHtml;
    }
    return el;
}

export function click(el: HTMLElement, callbackFn: (el: HTMLElement) => void): void {
    for (const next of emulatorsUi.dom.pointers.bind.enders) {
        el.addEventListener(next, () => {
            if (!el.classList.contains("jsdos-player-button-disabled")) {
                callbackFn(el);
            }
        });
    }
}

let downloadFileUrl: string | null = null;
export function downloadFile(data: Uint8Array, fileName: string, mimeType: string): void {
    const blob = new Blob([data], {
        type: mimeType,
    });

    if (downloadFileUrl !== null) {
        window.URL.revokeObjectURL(downloadFileUrl);
    }
    downloadFileUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadFileUrl;
    a.download = fileName;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    a.remove();
}
