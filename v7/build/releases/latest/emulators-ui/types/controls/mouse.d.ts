import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare enum MouseMode {
    DEFAULT = 0,
    SCREEN_MOVER = 1
}
export interface MouseProps {
    pointerButton: 0 | 1;
    mode: MouseMode;
}
export declare function mouse(layers: Layers, ci: CommandInterface, props: MouseProps): () => void;
