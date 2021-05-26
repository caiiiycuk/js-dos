import { Button } from "./button";
import { EventMapping } from "./nipple";
import { Mapper } from "./keyboard";
import { GridType } from "./grid";
export declare type LayerControlType = "Options" | "Key";
export interface LayerPosition {
    column: number;
    row: number;
}
export interface LayerControl extends LayerPosition {
    type: LayerControlType;
    symbol: string;
}
export interface LayerKeyControl extends LayerControl {
    mapTo: number;
}
export interface LayerConfig {
    grid: GridType;
    title: string;
    controls: LayerControl[];
}
export interface LayersConfig {
    version: number;
    layers: LayerConfig[];
}
export interface LegacyLayerConfig {
    name: string;
    buttons: Button[];
    gestures: EventMapping[];
    mapper: Mapper;
}
export declare type LegacyLayersConfig = {
    [index: string]: LegacyLayerConfig;
};
export declare function extractLayersConfig(config: any): LayersConfig | LegacyLayersConfig | null;
