import { LegacyLayersConfig } from "./layers-config";
import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import { DosInstance } from "../js-dos";
export declare function initLegacyLayersControl(dosInstance: DosInstance, layers: Layers, layersConfig: LegacyLayersConfig, ci: CommandInterface): () => void;
