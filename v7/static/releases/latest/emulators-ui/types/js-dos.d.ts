import { CommandInterface } from "emulators";
import { EmulatorsUi } from "./emulators-ui";
import { Layers } from "./dom/layers";
export declare class DosInstance {
    emulatorsUi: EmulatorsUi;
    layers: Layers;
    ciPromise?: Promise<CommandInterface>;
    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi);
    run(bundleUrl: string): Promise<CommandInterface>;
    stop(): Promise<void>;
}
export declare type DosFactoryType = (root: HTMLDivElement) => DosInstance;
