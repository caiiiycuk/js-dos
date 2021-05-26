import { EmulatorsUi } from "./../emulators-ui";
import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import { LayersConfig } from "./layers-config";
export declare function initLayersControl(layers: Layers, layersConfig: LayersConfig, ci: CommandInterface, emulatorsUi: EmulatorsUi): () => void;
