import { CommandInterface } from "emulators";
import { EmulatorsUi } from "./emulators-ui";
import { Layers, ControlSelector } from "./dom/layers";
export interface DosOptions {
    controlSelector?: ControlSelector;
}
export declare class DosInstance {
    emulatorsUi: EmulatorsUi;
    layers: Layers;
    ciPromise?: Promise<CommandInterface>;
    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi, options: DosOptions);
    run(bundleUrl: string): Promise<CommandInterface>;
    stop(): Promise<void>;
}
export declare type DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => DosInstance;
