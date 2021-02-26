import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare const ButtonSize = 52;
export declare type ActionType = "click" | "hold";
export interface Button {
    action: ActionType;
    mapTo: number;
    symbol?: string;
    position: {
        left?: 1 | 2;
        top?: 1 | 2;
        right?: 1 | 2;
        bottom?: 1 | 2;
    };
}
export interface ButtonHandler {
    onDown?: () => void;
    onUp?: () => void;
    onClick?: () => void;
}
export declare function createButton(symbol: string, handler: ButtonHandler, scale: number): HTMLDivElement;
export declare function button(layers: Layers, ci: CommandInterface, buttons: Button[]): () => void;
