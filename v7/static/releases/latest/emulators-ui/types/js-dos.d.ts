import { CommandInterface } from "emulators";
import { EmulatorsUi } from "./emulators-ui";
import { Layers, ControlSelector } from "./dom/layers";
export declare type EmulatorFunction = "dosWorker" | "dosDirect" | "janus";
export interface DosOptions {
    controlSelector?: ControlSelector;
    emulatorFunction?: EmulatorFunction;
    clickToStart?: boolean;
}
export declare class DosInstance {
    emulatorsUi: EmulatorsUi;
    emulatorFunction: EmulatorFunction;
    layers: Layers;
    ciPromise?: Promise<CommandInterface>;
    private clickToStart;
    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi, options: DosOptions);
    run(bundleUrl: string): Promise<CommandInterface>;
    stop(): Promise<void>;
}
export declare type DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => DosInstance;
