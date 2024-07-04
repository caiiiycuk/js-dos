import { LayersConfig, LegacyLayersConfig } from "./controls/layers-config";
import { Layers } from "./dom/layers";

export interface LayersInstance {
    config: LayersConfig | LegacyLayersConfig | null;
    layers: Layers,
    autolock: boolean;
    sensitivity: number,
    mirroredControls: boolean,
    scaleControls: number,
    activeLayer?: string,
    getActiveConfig(): LayersConfig | LegacyLayersConfig | null;
    setActiveConfig(config: LayersConfig | LegacyLayersConfig | null, layerName?: string): void;
};
