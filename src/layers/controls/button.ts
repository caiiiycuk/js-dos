import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
import { namedKeyCodes, KBD_NONE } from "../dom/keys";
import { pointer } from "../dom/pointer";
import { LayoutPosition } from "./layout";

export type ActionType = "click" | "hold";
// hold - means track press/release events separately

export type Binding = number;

export interface Button {
    action: ActionType,
    mapTo: Binding,
    symbol?: string,
    position: LayoutPosition,
}

const keyCodeToName = initKeyCodeToName();

function initKeyCodeToName() {
    const keyCodeToName: {[keyCode: number]: string} = {};
    for (const next of Object.keys(namedKeyCodes)) {
        keyCodeToName[namedKeyCodes[next]] = next.substr(4, 2);
    }
    return keyCodeToName;
}

export interface ButtonHandler {
    onDown?: () => void;
    onUp?: () => void;
    onClick?: () => void;
}

export interface HTMLJsDosButtonElement extends HTMLDivElement {
    widthPx: number;
    heightPx: number;
}

export function createButton(symbol: string,
                             handler: ButtonHandler,
                             size: number): HTMLJsDosButtonElement {
    const innerSize = Math.round(size * 0.6);
    const innerTextSize = Math.round(size * 0.5);
    const borderWidth = Math.max(1, Math.round(size / 20));
    const backgroundImage = symbolToUrl[symbol.toLowerCase()];
    const text = backgroundImage === undefined ? symbol : "";
    const button = createDiv("emulator-button-touch-zone") as HTMLJsDosButtonElement;
    const innerButton = createDiv("emulator-button");
    const innerText = createDiv("emulator-button-text",
        backgroundImage === undefined ? ((text === undefined || text.length === 0) ?
            "□" : text.substr(0, 1).toUpperCase()) : "");

    if (backgroundImage !== undefined) {
        innerButton.style.backgroundImage = "url(\"" + backgroundImage + "\")";
    }
    innerButton.style.width = innerSize + "px";
    innerButton.style.height = innerSize + "px";
    innerText.style.fontSize = innerTextSize + "px";

    button.widthPx = size - borderWidth * 2;
    button.heightPx = size - borderWidth * 2;
    button.style.width = button.widthPx + "px";
    button.style.height = button.heightPx + "px";
    button.style.borderWidth = borderWidth + "px";
    button.appendChild(innerButton);
    button.appendChild(innerText);

    const onStart = (e: Event) => {
        if (handler.onDown !== undefined) {
            handler.onDown();
        }
        if (handler.onClick !== undefined) {
            handler.onClick();
        }
        e.stopPropagation();
        e.preventDefault();
    };
    const onEnd = (e: Event) => {
        if (handler.onUp !== undefined) {
            handler.onUp();
        }
        e.stopPropagation();
        e.preventDefault();
    };
    const onPrevent = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
    };
    const options = {
        capture: true,
    };
    for (const next of pointer.starters) {
        button.addEventListener(next, onStart, options);
    }
    for (const next of pointer.enders) {
        button.addEventListener(next, onEnd, options);
    }
    for (const next of pointer.changers) {
        button.addEventListener(next, onPrevent, options);
    }
    for (const next of pointer.leavers) {
        button.addEventListener(next, onPrevent, options);
    }
    for (const next of pointer.prevents) {
        button.addEventListener(next, onPrevent, options);
    }
    return button;
}

export function deprecatedButton(layers: Layers,
                                 ci: CommandInterface,
                                 buttons: Button[],
                                 size: number) {
    const ident = Math.round(size / 4);
    const toRemove: HTMLElement[] = [];

    for (const next of buttons) {
        if (next.mapTo === KBD_NONE) {
            continue;
        }

        const symbol = (next.symbol || mapToSymbol(next.mapTo)).toUpperCase();
        const handler = deprecatedCreateHandler(next, layers);
        const button = createButton(symbol, handler, size);

        button.style.position = "absolute";
        const cssStyle = (next as any).style;
        if (cssStyle) {
            for (const prop of Object.keys(cssStyle)) {
                (button.style as any)[prop] = (cssStyle as any)[prop];
            }
        }

        if (next.position !== undefined) {
            const left = next.position.left;
            const top = next.position.top;
            const bottom = next.position.bottom;
            const right = next.position.right;

            if (left !== undefined) {
                button.style.left = (ident * left + size * (left - 1)) + "px";
            }

            if (right !== undefined) {
                button.style.right = (ident * right + size * (right - 1)) + "px";
            }

            if (top !== undefined) {
                button.style.top = (ident * top + size * (top - 1)) + "px";
            }

            if (bottom !== undefined) {
                button.style.bottom = (ident * bottom + size * (bottom - 1)) + "px";
            }
        }
        layers.mouseOverlay.appendChild(button);
        toRemove.push(button);
    }

    return () => {
        for (const next of toRemove) {
            if (next.parentElement === layers.mouseOverlay) {
                layers.mouseOverlay.removeChild(next);
            }
        }
    };
}

function createDiv(className: string, innerHtml?: string) {
    const el = document.createElement("div");
    el.className = className;
    if (innerHtml !== undefined) {
        el.innerHTML = innerHtml;
    }
    return el;
}

function mapToSymbol(mapTo: Binding): string {
    if (typeof mapTo === "number") {
        return keyCodeToName[mapTo];
    }

    return mapTo;
}

function deprecatedCreateHandler(button: Button,
                                 layers: Layers): ButtonHandler {
    return button.action === "click" ?
        { onClick: () => layers.fireKeyPress(button.mapTo) } :
        {
            onDown: () => layers.fireKeyDown(button.mapTo),
            onUp: () => layers.fireKeyUp(button.mapTo),
        };
}

/* eslint-disable max-len */
const down = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 20 20' fill='%23FFF' enable-background='new 0 0 20 20' xml:space='preserve'%3E%3Ctitle%3EShape%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg id='Page-1' sketch:type='MSPage'%3E%3Cg id='Artboard-1' transform='translate(-3.000000, -1.000000)' sketch:type='MSArtboardGroup'%3E%3Cpath id='Shape' sketch:type='MSShapeGroup' d='M19,12c-0.3,0-0.5,0.1-0.7,0.3L14,16.6V3c0-0.5-0.4-1-1-1s-1,0.5-1,1v13.6 l-4.3-4.3C7.5,12.1,7.3,12,7,12c-0.5,0-1,0.4-1,1c0,0.3,0.1,0.5,0.3,0.7l6,6c0.2,0.2,0.4,0.3,0.7,0.3s0.5-0.1,0.7-0.3l6-6 c0.2-0.2,0.3-0.4,0.3-0.7C20,12.4,19.5,12,19,12L19,12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
const left = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 20 20' enable-background='new 0 0 20 20' fill='%23FFF' xml:space='preserve'%3E%3Cg id='left_arrow_1_'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18,9H4.41l4.29-4.29C8.89,4.53,9,4.28,9,4c0-0.55-0.45-1-1-1 C7.72,3,7.47,3.11,7.29,3.29l-6,6C1.11,9.47,1,9.72,1,10c0,0.28,0.11,0.53,0.29,0.71l6,6C7.47,16.89,7.72,17,8,17 c0.55,0,1-0.45,1-1c0-0.28-0.11-0.53-0.29-0.71L4.41,11H18c0.55,0,1-0.45,1-1C19,9.45,18.55,9,18,9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
const right = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' fill='%23fff' viewBox='0 0 20 20' enable-background='new 0 0 20 20' xml:space='preserve'%3E%3Cg id='right_arrow_1_'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18.71,9.29l-6-6C12.53,3.11,12.28,3,12,3c-0.55,0-1,0.45-1,1 c0,0.28,0.11,0.53,0.29,0.71L15.59,9H2c-0.55,0-1,0.45-1,1c0,0.55,0.45,1,1,1h13.59l-4.29,4.29C11.11,15.47,11,15.72,11,16 c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l6-6C18.89,10.53,19,10.28,19,10C19,9.72,18.89,9.47,18.71,9.29z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
const enter = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 18.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' fill='%23fff' viewBox='0 0 20 20' enable-background='new 0 0 20 20' xml:space='preserve'%3E%3Cg id='key_enter_1_'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M18,2c-0.55,0-1,0.45-1,1v5c0,2.21-1.79,4-4,4H4.41l2.29-2.29 C6.89,9.53,7,9.28,7,9c0-0.55-0.45-1-1-1C5.72,8,5.47,8.11,5.29,8.29l-4,4C1.11,12.47,1,12.72,1,13c0,0.28,0.11,0.53,0.29,0.71 l4,4C5.47,17.89,5.72,18,6,18c0.55,0,1-0.45,1-1c0-0.28-0.11-0.53-0.29-0.71L4.41,14H13c3.31,0,6-2.69,6-6V3C19,2.45,18.55,2,18,2 z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
const symbolToUrl: {[symbol: string]: string} = {
    fullscreen: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'%3E%3Cg id='maximize_1_' fill='%23FFFFFF'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M5.99,8.99c-0.28,0-0.53,0.11-0.71,0.29l-3.29,3.29v-1.59c0-0.55-0.45-1-1-1 s-1,0.45-1,1v4c0,0.55,0.45,1,1,1h4c0.55,0,1-0.45,1-1s-0.45-1-1-1H3.41L6.7,10.7c0.18-0.18,0.29-0.43,0.29-0.71 C6.99,9.44,6.54,8.99,5.99,8.99z M14.99-0.01h-4c-0.55,0-1,0.45-1,1s0.45,1,1,1h1.59L9.28,5.29C9.1,5.47,8.99,5.72,8.99,5.99 c0,0.55,0.45,1,1,1c0.28,0,0.53-0.11,0.71-0.29l3.29-3.29v1.59c0,0.55,0.45,1,1,1s1-0.45,1-1v-4C15.99,0.44,15.54-0.01,14.99-0.01 z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    save: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 18.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' fill='%23FFFFFF' xml:space='preserve'%3E%3Cg id='floppy_disk'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M15.71,2.29l-2-2C13.53,0.11,13.28,0,13,0h-1v6H4V0H1C0.45,0,0,0.45,0,1v14 c0,0.55,0.45,1,1,1h14c0.55,0,1-0.45,1-1V3C16,2.72,15.89,2.47,15.71,2.29z M14,15H2V9c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1V15 z M11,1H9v4h2V1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A",
    options: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 20 20' enable-background='new 0 0 20 20' fill='%23FFF' xml:space='preserve'%3E%3Cg id='cog_2_'%3E%3Cg%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M19,8h-2.31c-0.14-0.46-0.33-0.89-0.56-1.3l1.7-1.7c0.39-0.39,0.39-1.02,0-1.41 l-1.41-1.41c-0.39-0.39-1.02-0.39-1.41,0l-1.7,1.7c-0.41-0.22-0.84-0.41-1.3-0.55V1c0-0.55-0.45-1-1-1H9C8.45,0,8,0.45,8,1v2.33 C7.52,3.47,7.06,3.67,6.63,3.91L5,2.28c-0.37-0.37-0.98-0.37-1.36,0L2.28,3.64C1.91,4.02,1.91,4.63,2.28,5l1.62,1.62 C3.66,7.06,3.46,7.51,3.31,8H1C0.45,8,0,8.45,0,9v2c0,0.55,0.45,1,1,1h2.31c0.14,0.46,0.33,0.89,0.56,1.3L2.17,15 c-0.39,0.39-0.39,1.02,0,1.41l1.41,1.41c0.39,0.39,1.02,0.39,1.41,0l1.7-1.7c0.41,0.22,0.84,0.41,1.3,0.55V19c0,0.55,0.45,1,1,1h2 c0.55,0,1-0.45,1-1v-2.33c0.48-0.14,0.94-0.35,1.37-0.59L15,17.72c0.37,0.37,0.98,0.37,1.36,0l1.36-1.36 c0.37-0.37,0.37-0.98,0-1.36l-1.62-1.62c0.24-0.43,0.45-0.89,0.6-1.38H19c0.55,0,1-0.45,1-1V9C20,8.45,19.55,8,19,8z M10,14 c-2.21,0-4-1.79-4-4c0-2.21,1.79-4,4-4s4,1.79,4,4C14,12.21,12.21,14,10,14z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    keyboard: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 18.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 16 16' enable-background='new 0 0 16 16' xml:space='preserve'%3E%3Cg id='manually_entered_data_2_'%3E%3Cg%3E%3Cpath fill='%23FFFFFF' fill-rule='evenodd' clip-rule='evenodd' d='M1,8h3.76l2-2H1C0.45,6,0,6.45,0,7C0,7.55,0.45,8,1,8z M15.49,3.99 C15.8,3.67,16,3.23,16,2.75C16,1.78,15.22,1,14.25,1c-0.48,0-0.92,0.2-1.24,0.51l-1.44,1.44l2.47,2.47L15.49,3.99z M1,4h7.76l2-2 H1C0.45,2,0,2.45,0,3C0,3.55,0.45,4,1,4z M1,10c-0.55,0-1,0.45-1,1c0,0.48,0.35,0.86,0.8,0.96L2.76,10H1z M10.95,3.57l-6.69,6.69 l2.47,2.47l6.69-6.69L10.95,3.57z M15.2,6.04L13.24,8H15c0.55,0,1-0.45,1-1C16,6.52,15.65,6.14,15.2,6.04z M2,15l3.86-1.39 l-2.46-2.44L2,15z M15,10h-3.76l-2,2H15c0.55,0,1-0.45,1-1C16,10.45,15.55,10,15,10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    up: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Layer_1' xmlns:sketch='http://www.bohemiancoding.com/sketch/ns' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 20 20' fill='%23FFF' enable-background='new 0 0 20 20' xml:space='preserve'%3E%3Ctitle%3EShape%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg id='Page-1' sketch:type='MSPage'%3E%3Cg id='Artboard-1' transform='translate(-3.000000, -1.000000)' sketch:type='MSArtboardGroup'%3E%3Cpath id='Shape' sketch:type='MSShapeGroup' d='M19.7,8.3l-6-6C13.5,2.1,13.3,2,13,2s-0.5,0.1-0.7,0.3l-6,6C6.1,8.5,6,8.7,6,9 c0,0.6,0.5,1,1,1c0.3,0,0.5-0.1,0.7-0.3L12,5.4V19c0,0.5,0.4,1,1,1s1-0.5,1-1V5.4l4.3,4.3C18.5,9.9,18.7,10,19,10c0.5,0,1-0.4,1-1 C20,8.7,19.9,8.5,19.7,8.3L19.7,8.3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
    down,
    do: down,
    dw: down,
    dwn: down,
    left,
    le: left,
    lft: left,
    right,
    ri: right,
    rght: right,
    rgh: right,
    enter,
    en: enter,
    enr: enter,
    ent: enter,
    entr: enter,
};

