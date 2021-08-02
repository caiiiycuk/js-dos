import { LegacyLayersConfig } from "./layers-config";
import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
export declare function initLegacyLayersControl(layers: Layers, layersConfig: LegacyLayersConfig, ci: CommandInterface): () => void;
