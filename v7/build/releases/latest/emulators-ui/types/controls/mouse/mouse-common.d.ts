import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";
export declare function mapXY(eX: number, eY: number, ci: CommandInterface, layers: Layers): {
    x: number;
    y: number;
};
export declare function mount(el: HTMLDivElement, layers: Layers, onMouseDown: (x: number, y: number, button: number) => void, onMouseMove: (x: number, y: number, mX: number, mY: number) => void, onMouseUp: (x: number, y: number, button: number) => void, onMouseLeave: (x: number, y: number) => void): () => void;
export declare function mouse(autolock: boolean, sensitivity: number, layers: Layers, ci: CommandInterface): () => void;
