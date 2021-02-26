import { CommandInterface } from "emulators";
import { EmulatorsUi } from "./emulators-ui";
import { Layers, LayersOptions } from "./dom/layers";
export declare type EmulatorFunction = "dosWorker" | "dosDirect" | "janus";
export interface DosOptions {
    emulatorFunction?: EmulatorFunction;
    clickToStart?: boolean;
    layersOptions?: LayersOptions;
}
export declare class DosInstance {
    emulatorsUi: EmulatorsUi;
    emulatorFunction: EmulatorFunction;
    layers: Layers;
    ciPromise?: Promise<CommandInterface>;
    enableMobileControls: () => void;
    disableMobileControls: () => void;
    private clickToStart;
    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi, options: DosOptions);
    run(bundleUrl: string, optionalChangesUrl?: string): Promise<CommandInterface>;
    stop(): Promise<void>;
}
export declare type DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => DosInstance;
