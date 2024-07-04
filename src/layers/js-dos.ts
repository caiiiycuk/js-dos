import { Emulators, CommandInterface, BackendOptions } from "emulators";
import { TransportLayer } from "emulators/dist/types/protocol/protocol";
import { EmulatorsUi } from "./emulators-ui";
import { Layers, LayersOptions } from "./dom/layers";

import { extractLayersConfig, LegacyLayersConfig, LayersConfig } from "./controls/layers-config";

import { initLegacyLayersControl } from "./controls/legacy-layers-control";
import { initNullLayersControl } from "./controls/null-layers-control";
import { initLayersControl } from "./controls/layers-control";

import { pointers } from "./dom/pointer";

declare const emulators: Emulators;

export type EmulatorFunction = "dosboxWorker" | "dosboxDirect" | "dosboxNode" | "janus" | "backend";

export interface DosOptions {
    sensitivityValue?: number;
    mirroredControls?: boolean;
    scaleControls?: number;
    aspect?: number;
    noWebGL?: boolean;
    emulatorFunction?: EmulatorFunction;
    clickToStart?: boolean;
    layersOptions?: LayersOptions;
    createTransportLayer?: () => TransportLayer;
}

export class DosInstance {
    emulatorsUi: EmulatorsUi;
    emulatorFunction: EmulatorFunction;
    createTransportLayer?: () => TransportLayer;
    layers: Layers;
    layersConfig: LayersConfig | LegacyLayersConfig | null = null;
    ciPromise?: Promise<CommandInterface>;

    options: DosOptions;
    mobileControls: boolean;
    mirroredControls: boolean;
    scaleControls: number;

    autolock: boolean;
    sensitivity: number;

    storage: Storage;

    volume: number;

    private clickToStart: boolean;
    private unbindControls: () => void = () => {/**/};
    private storedLayersConfig: LayersConfig | LegacyLayersConfig | null = null;
    private onMobileControlsChanged: (visible: boolean) => void;
    private onSensitivityChanged: ((sensitivity: number) => void)[] = [];
    private onScaleChanged: ((scale: number) => void)[] = [];
    private onVolumeChanged: ((scale: number) => void)[] = [];

    setVolumeImplFn: (volume: number) => void = () => {};

    constructor(root: HTMLDivElement, emulatorsUi: EmulatorsUi, options: DosOptions) {
        this.options = options;
        this.emulatorsUi = emulatorsUi;
        this.storage = emulatorsUi.dom.storage;
        this.emulatorFunction = options.emulatorFunction || "dosboxWorker";
        this.clickToStart = options.clickToStart || false;
        this.layers = this.emulatorsUi.dom.layers(root, options.layersOptions);
        this.layers.showLoadingLayer();
        this.createTransportLayer = options.createTransportLayer;
        this.mobileControls = pointers.bind.mobile;
        this.autolock = false;

        this.mirroredControls =
            this.options.mirroredControls === true ||
            this.storage.getItem("mirroredControls") === "true";

        const scaleControlsValue =
        this.options.scaleControls ??
            Number.parseFloat(this.storage.getItem("scaleControls") ?? "1.0");
        this.scaleControls = Number.isNaN(scaleControlsValue) ? 1.0 : scaleControlsValue;

        const sensitivityValue =
            this.options.sensitivityValue ??
            Number.parseFloat(this.storage.getItem("sensitivity") ?? "1.0");
        this.sensitivity = Number.isNaN(sensitivityValue) ? 1.0 : sensitivityValue;

        const volumeValue = Number.parseFloat(this.storage.getItem("volume") ?? "1.0");
        this.volume = Number.isNaN(volumeValue) ? 1.0 : volumeValue;

        this.onMobileControlsChanged = () => {/**/};

        if (this.emulatorFunction === "backend" && this.createTransportLayer === undefined) {
            throw new Error("Emulator function set to 'backend' but 'createTransportLayer' is not a function");
        }
    }

    async run(bundleUrl: string,
        optionalChangesUrl?: string,
        optionalPersistKey?: string): Promise<CommandInterface> {
        await this.stop();
        this.layers.setLoadingMessage("Starting...");

        const persistKey = (optionalPersistKey !== undefined &&
            optionalPersistKey !== null && optionalPersistKey.length > 0) ?
            optionalPersistKey : bundleUrl + ".changes";

        let ci: CommandInterface;
        try {
            ci = await this.runBundle(bundleUrl, optionalChangesUrl, persistKey);
        } catch (e) {
            this.layers.setLoadingMessage("Unexpected error occured...");
            this.layers.notyf.error({ message: "Can't start emulator look browser logs for more info" });
            // eslint-disable-next-line
            console.error(e);
            throw e;
        }

        const emulatorsUi = this.emulatorsUi;
        if (this.emulatorFunction === "janus") {
            emulatorsUi.graphics.video(this.layers, ci);
        } else {
            emulatorsUi.persist.save(persistKey, this.layers, ci, emulators);
            try {
                if (this.options.noWebGL === true) {
                    throw new Error("WebGL is disabled by options");
                }
                emulatorsUi.graphics.webGl(this.layers, ci, this.options.aspect);
            } catch (e) {
                // eslint-disable-next-line
                console.error("Unable to create webgl canvas, fallback to 2d rendering");
                emulatorsUi.graphics._2d(this.layers, ci, this.options.aspect);
            }
            this.setVolumeImplFn = emulatorsUi.sound.audioNode(ci);
            this.setVolumeImplFn(this.volume);
        }

        emulatorsUi.dom.lifecycle(ci);

        const config = await ci.config();
        this.autolock = config.output?.options?.autolock?.value === true;
        await this.setLayersConfig(extractLayersConfig(config));

        if (!this.mobileControls) {
            this.mobileControls = true; // force disabling
            this.disableMobileControls();
        }

        this.layers.setLoadingMessage("Ready");
        this.layers.hideLoadingLayer();

        if (this.clickToStart) {
            this.layers.showClickToStart();
        }

        return ci;
    }

    async stop(): Promise<void> {
        this.layers.showLoadingLayer();

        if (this.ciPromise === undefined) {
            return;
        }

        const ci = await this.ciPromise;
        delete this.ciPromise;
        await ci.exit();

        return;
    }

    public async setLayersConfig(config: LayersConfig | LegacyLayersConfig | null, layerName?: string) {
        if (this.ciPromise === undefined) {
            return;
        }

        const ci = await this.ciPromise;

        this.layersConfig = config;
        this.unbindControls();

        if (config === null) {
            this.unbindControls = initNullLayersControl(this, this.layers, ci);
        } else if (config.version === undefined) {
            this.unbindControls = initLegacyLayersControl(this, this.layers, config as LegacyLayersConfig, ci);
        } else {
            this.unbindControls = initLayersControl(this.layers, config as LayersConfig,
                ci, this, this.mirroredControls, this.scaleControls, layerName);
        }
    }

    public getLayersConfig(): LayersConfig | LegacyLayersConfig | null {
        return this.layersConfig;
    }

    public async enableMobileControls() {
        if (this.mobileControls) {
            return;
        }
        this.mobileControls = true;
        await this.setLayersConfig(this.storedLayersConfig);
        this.storedLayersConfig = null;
        this.onMobileControlsChanged(true);
    }

    public async disableMobileControls() {
        if (!this.mobileControls) {
            return;
        }
        this.mobileControls = false;
        this.storedLayersConfig = this.layersConfig;
        await this.setLayersConfig(null);
        this.onMobileControlsChanged(false);
    }

    public async setMirroredControls(mirrored: boolean) {
        if (this.mirroredControls === mirrored) {
            return;
        }
        this.mirroredControls = mirrored;
        this.storage.setItem("mirroredControls", mirrored + "");
        if (mirrored) {
            if (this.mobileControls) {
                await this.setLayersConfig(this.layersConfig);
            } else {
                await this.enableMobileControls();
            }
        } else {
            if (this.mobileControls) {
                await this.setLayersConfig(this.layersConfig);
            } else {
                // do nothing
            }
        }
    }

    public async setScaleControls(scale: number) {
        if (scale === this.scaleControls) {
            return;
        }
        this.scaleControls = scale;
        this.storage.setItem("scaleControls", scale + "");
        if (this.mobileControls) {
            await this.setLayersConfig(this.layersConfig);
        }
        for (const next of this.onScaleChanged) {
            next(this.scaleControls);
        }
    }

    public async setSensitivity(sensitivity: number) {
        if (sensitivity === this.sensitivity) {
            return;
        }
        this.sensitivity = sensitivity;
        this.storage.setItem("sensitivity", sensitivity + "");
        await this.setLayersConfig(this.layersConfig);
        for (const next of this.onSensitivityChanged) {
            next(this.sensitivity);
        }
    }

    public async setVolume(volume: number) {
        this.volume = volume;
        this.storage.setItem("volume", volume + "");
        this.setVolumeImplFn(volume);
        for (const next of this.onVolumeChanged) {
            next(this.volume);
        }
    }

    public async setAutolock(autolock: boolean) {
        if (autolock === this.autolock) {
            return;
        }
        this.autolock = autolock;
        await this.setLayersConfig(this.layersConfig);
    }

    public setOnMobileControlsChanged(handler: (visible: boolean) => void) {
        this.onMobileControlsChanged = handler;
    }

    public registerOnSensitivityChanged = (handler: (sensitivity: number) => void) => {
        this.onSensitivityChanged.push(handler);
    };

    public removeOnSensitivityChanged = (handler: (sensitivity: number) => void) => {
        this.onSensitivityChanged = this.onSensitivityChanged.filter((n) => n !== handler);
    };

    public registerOnScaleChanged = (handler: (scale: number) => void) => {
        this.onScaleChanged.push(handler);
    };

    public removeOnScaleChanged = (handler: (scale: number) => void) => {
        this.onScaleChanged = this.onScaleChanged.filter((n) => n !== handler);
    };

    public registerOnVolumeChanged = (handler: (volume: number) => void) => {
        this.onVolumeChanged.push(handler);
    };

    public removeOnVolumeChanged = (handler: (volume: number) => void) => {
        this.onVolumeChanged = this.onVolumeChanged.filter((n) => n !== handler);
    };

    private async runBundle(bundleUrl: string, optionalChangesUrl: string | undefined, persistKey: string) {
        const emulatorsUi = this.emulatorsUi;
        if (this.emulatorFunction === "janus") {
            this.layers.setLoadingMessage("Connecting...");
            this.ciPromise = emulators.janus(bundleUrl);
        } else {
            this.layers.setLoadingMessage("Downloading bundle ...");
            const bundlePromise = emulatorsUi.network.resolveBundle(bundleUrl, {
                onprogress: (percent) => this.layers.setLoadingMessage("Downloading bundle " + percent + "%"),
            });
            const options: BackendOptions = {
                onExtractProgress: (index, file, extracted, total) => {
                    if (index !== 0) {
                        return;
                    }

                    const percent = Math.round(extracted / total * 100);
                    const lastIndex = file.lastIndexOf("/");

                    const name = file.substring(lastIndex + 1);
                    this.layers.setLoadingMessage("Extracting " + percent + "% (" + name + ")");
                },
            };
            try {
                let changesBundle: Uint8Array | undefined;
                if (optionalChangesUrl !== undefined && optionalChangesUrl !== null && optionalChangesUrl.length > 0) {
                    changesBundle = await emulatorsUi.network.resolveBundle(optionalChangesUrl, { httpCache: false });
                } else {
                    changesBundle = await emulatorsUi.persist.load(persistKey, emulators);
                }
                const bundle = await bundlePromise;
                if (this.emulatorFunction === "backend") {
                    this.ciPromise = emulators.backend([bundle, changesBundle],
                        (this as any).createTransportLayer() as TransportLayer, options);
                } else {
                    this.ciPromise = emulators[this.emulatorFunction]([bundle, changesBundle], options);
                }
            } catch {
                const bundle = await bundlePromise;
                if (this.emulatorFunction === "backend") {
                    this.ciPromise = emulators.backend([bundle],
                        (this as any).createTransportLayer() as TransportLayer, options);
                } else {
                    this.ciPromise = emulators[this.emulatorFunction]([bundle], options);
                }
            }
        }

        return this.ciPromise;
    }
}

export type DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => DosInstance;
