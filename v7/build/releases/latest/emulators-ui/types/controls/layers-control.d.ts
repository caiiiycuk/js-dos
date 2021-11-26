import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import { LayersConfig } from "./layers-config";
import { DosInstance } from "../js-dos";
export declare function initLayersControl(layers: Layers, layersConfig: LayersConfig, ci: CommandInterface, dosInstance: DosInstance, mirrored: boolean, scale: number, layerName?: string): () => void;
