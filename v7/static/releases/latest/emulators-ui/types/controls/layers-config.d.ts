import { Button } from "./button";
import { EventMapping } from "./nipple";
import { Mapper } from "./keyboard";
import { GridType } from "./grid";
export declare type LayerControlType = "Options" | "Key" | "Keyboard" | "Switch" | "ScreenMove" | "PointerButton" | "NippleActivator";
export interface LayerPosition {
    column: number;
    row: number;
}
export interface LayerControl extends LayerPosition {
    type: LayerControlType;
    symbol: string;
}
export interface LayerKeyControl extends LayerControl {
    mapTo: number[];
}
export interface LayerSwitchControl extends LayerControl {
    layerName: string;
}
export interface LayerScreenMoveControl extends LayerControl {
    direction: "up" | "down" | "left" | "right" | "up-left" | "up-right" | "down-left" | "down-right";
}
export interface LayerPointerButtonControl extends LayerControl {
    button: 0 | 1;
    click: boolean;
}
export interface LayerNippleActivatorControl extends LayerControl {
}
export interface LayerPointerResetControl extends LayerControl {
}
export interface LayerPointerToggleControl extends LayerControl {
}
export interface LayerPointerMoveControl extends LayerControl {
    x: number;
    y: number;
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
