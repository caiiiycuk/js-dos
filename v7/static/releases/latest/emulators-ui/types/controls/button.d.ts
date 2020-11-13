import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare type ActionType = "click" | "hold";
export interface Button {
    action: ActionType;
    mapTo: number;
    size?: number;
    symbol?: string;
    style?: ElementCSSInlineStyle;
}
export declare function button(layers: Layers, ci: CommandInterface, buttons: Button[]): () => void;
