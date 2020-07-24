import { CommandInterface } from "emulators";
import { Layers } from "emulators-ui/dist/types/dom/layers";
export declare class DosInstance {
    layers: Layers;
    ciPromise?: Promise<CommandInterface>;
    constructor(root: HTMLDivElement);
    run(bundleUrl: string): Promise<CommandInterface>;
    stop(): Promise<void>;
}
export declare type DosFactoryType = (root: HTMLDivElement) => DosInstance;
export declare const DosFactory: DosFactoryType;
