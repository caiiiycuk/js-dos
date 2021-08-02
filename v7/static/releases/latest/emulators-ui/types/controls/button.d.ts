import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
import { LayoutPosition } from "./layout";
export declare type ActionType = "click" | "hold";
export declare type Binding = number;
export interface Button {
    action: ActionType;
    mapTo: Binding;
    symbol?: string;
    position: LayoutPosition;
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
export declare function createButton(symbol: string, handler: ButtonHandler, size: number): HTMLJsDosButtonElement;
export declare function deprecatedButton(layers: Layers, ci: CommandInterface, buttons: Button[], size: number): () => void;
