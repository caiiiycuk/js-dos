import { CommandInterface, Emulators } from "emulators";
import { Layers } from "../dom/layers";
export declare function save(key: string, layers: Layers, ci: CommandInterface, emulators: Emulators): void;
export declare function load(key: string, emulators: Emulators): Promise<Uint8Array>;
