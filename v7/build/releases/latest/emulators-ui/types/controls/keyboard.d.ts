import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare type Mapper = {
    [keyCode: number]: number;
};
export declare function keyboard(layers: Layers, ci: CommandInterface, mapperOpt?: Mapper): () => void;
