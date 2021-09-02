import { EmulatorsUi } from "emulators-ui";

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