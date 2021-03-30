import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
import { LayoutPosition } from "./layout";
import { MouseProps } from "./mouse";
export declare const ButtonSize = 54;
export declare type ActionType = "click" | "hold";
export declare type SpecialBinding = "mouseScreenMover" | "mouseRightButton";
export declare type Binding = number | SpecialBinding;
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
export declare function createButton(symbol: string, handler: ButtonHandler, scale: number): HTMLDivElement;
export declare function button(layers: Layers, ci: CommandInterface, buttons: Button[], mouseProps: MouseProps): () => void;
