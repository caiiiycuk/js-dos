import { CommandInterface } from "emulators";
import { TransportLayer } from "emulators/dist/types/protocol/protocol";
import { EmulatorsUi } from "./emulators-ui";
import { Layers, LayersOptions } from "./dom/layers";
import { LegacyLayersConfig, LayersConfig } from "./controls/layers-config";
export declare type EmulatorFunction = "dosboxWorker" | "dosboxDirect" | "dosboxNode" | "janus" | "backend";
export interface DosOptions {
    noWebGL?: boolean;
    emulatorFunction?: EmulatorFunction;
    clickToStart?: boolean;
    layersOptions?: LayersOptions;
    createTransportLayer?: () => TransportLayer;
}
export declare class DosInstance {
    static initialRun: boolean;
    emulatorsUi: EmulatorsUi;
    emulatorFunction: EmulatorFunction;
    createTransportLayer?: () => TransportLayer;
    layers: Layers;
    layersConfig: LayersConfig | LegacyLayersConfig | null;
    ciPromise?: Promise<CommandInterface>;
    options: DosOptions;
    private clickToStart;
    private unbindControls;
    private storedLayersConfig;
    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi, options: DosOptions);
    run(bundleUrl: string, optionalChangesUrl?: string): Promise<CommandInterface>;
    stop(): Promise<void>;
    setLayersConfig(config: LayersConfig | LegacyLayersConfig | null, layerName?: string): Promise<void>;
    getLayersConfig(): LayersConfig | LegacyLayersConfig | null;
    enableMobileControls(): void;
    disableMobileControls(): void;
    private runBundle;
}
export declare type DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => DosInstance;
