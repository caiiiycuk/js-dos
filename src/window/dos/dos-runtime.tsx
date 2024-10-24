import { useDispatch, useSelector, useStore } from "react-redux";
import { dosSlice, FitConstant } from "../../store/dos";
import { getState, State, Store, useNonSerializableStore } from "../../store";
import { CommandInterface } from "emulators";
import { keyboard } from "./controls/keyboard";
import { webGl as webglRender } from "./render/webgl";
import { canvas as canvasRender } from "./render/canvas";
import { audioNode } from "./sound/audio-node";
import { useEffect } from "preact/hooks";
import { mouse } from "./controls/mouse";
import { KBD_0 } from "./controls/keys";
import { uiSlice } from "../../store/ui";
import { useT } from "../../i18n";
import { Layers } from "../../layers/dom/layers";
import { LayersConfig, LegacyLayersConfig, extractLayersConfig } from "../../layers/controls/layers-config";
import { initLegacyLayersControl } from "../../layers/controls/legacy-layers-control";
import { initLayersControl } from "../../layers/controls/layers-control";
import { LayersInstance } from "../../layers/instance";

export function useDosRuntime(canvas: HTMLCanvasElement,
                              ci: CommandInterface): void {
    useLog(ci);
    useRenderImage(canvas);
    useStats(ci);
    usePause(ci);
    useKeyboard(ci);
    useMouse(canvas, ci);
    useLayers(canvas, ci);
    useRenderBackend(canvas, ci);
    useAudioBackend(ci);
}

function useLog(ci: CommandInterface): void {
    const dispatch = useDispatch();
    const t = useT();
    useEffect(() => {
        const preloadProgress: { [drive: string]: number } = {};
        const isFork: { [drive: string]: boolean } = {};
        ci.events().onMessage((msgType, ...args: string[]) => {
            if (msgType === "error" && args[0]?.startsWith("[panic]")) {
                dispatch(uiSlice.actions.showToast({
                    message: args[0],
                    intent: "panic",
                }));
            } else if (msgType === "log" && args[0]?.indexOf("sockdrive:") !== -1) {
                const drive = args[0].substring(args[0].indexOf(" ") + 1, args[0].indexOf(","));
                dispatch(uiSlice.actions.cloudSaves(false));
                if (args[0]?.indexOf("write=") !== -1) {
                    const name = drive.substring(drive.indexOf("/") + 1);
                    if (name.startsWith("@")) {
                        isFork[drive.substring(drive.indexOf(".", drive.indexOf("/")) + 1)] = true;
                    }
                    dispatch(dosSlice.actions.addSockdriveInfo({
                        drive,
                        write: args[0]?.indexOf("write=false") === -1,
                    }));
                }
                if (args[0]?.indexOf("preload=") !== -1) {
                    const rest = Number.parseInt(args[0].substring(args[0].indexOf("preload=") + "preload=".length));
                    if (preloadProgress[drive] === undefined) {
                        preloadProgress[drive] = rest;
                    }

                    const name = drive.substring(drive.indexOf("/") + 1);
                    dispatch(uiSlice.actions.showToast({
                        message: t("preloading_sockdrive") + " " +
                            (isFork[name] ? "@" + name : name) + " — " +
                            (Math.round(preloadProgress[drive] - rest) / 1024 / 1024).toFixed(2) + "/" +
                            (Math.round(preloadProgress[drive] / 1024 / 1024)) + "Mb",
                        long: true,
                    }));
                }
            }
        });
    }, [ci, dispatch]);
}

function useRenderImage(canvas: HTMLCanvasElement): void {
    const rendering = useSelector((state: State) => state.dos.imageRendering);
    useEffect(() => {
        canvas.style.imageRendering = rendering === "smooth" ? "auto" : rendering;
    }, [canvas, rendering]);
}

function useMouse(canvas: HTMLCanvasElement,
                  ci: CommandInterface): void {
    const mobileControls = useSelector((state: State) => state.dos.mobileControls);
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const mouseSensitivity = 0.1 + useSelector((state: State) => state.dos.mouseSensitivity) * 3;
    useEffect(() => {
        if (!mobileControls) {
            return mouse(mouseCapture, mouseSensitivity, 0, canvas, ci);
        }
    }, [canvas, ci, mouseCapture, mouseSensitivity, mobileControls]);
}

function useKeyboard(ci: CommandInterface): void {
    useEffect(() => {
        return keyboard(window as any, ci);
    }, [ci]);
}

function useRenderBackend(canvas: HTMLCanvasElement,
                          ci: CommandInterface): void {
    const renderBackend = useSelector((state: State) => state.dos.renderBackend);
    const renderAspect = useSelector((state: State) => state.dos.renderAspect);

    let aspect: number | undefined = undefined;
    switch (renderAspect) {
        case "1/1": aspect = 1; break;
        case "5/4": aspect = 5 / 4; break;
        case "4/3": aspect = 4 / 3; break;
        case "16/10": aspect = 16 / 10; break;
        case "16/9": aspect = 16 / 9; break;
        case "Fit": aspect = FitConstant;
        default:
    }

    useEffect(() => {
        let unbind = () => { };

        if (renderBackend === "canvas") {
            unbind = canvasRender(canvas, ci, aspect);
        } else {
            try {
                unbind = webglRender(canvas, ci, aspect);
            } catch (e) {
                console.error("Unalbe to start webgl render", e);
                unbind = canvasRender(canvas, ci, aspect);
            }
        }

        return unbind;
    }, [canvas, ci, renderBackend, aspect]);
}

function useAudioBackend(ci: CommandInterface): void {
    const store = useStore() as Store;

    useEffect(() => {
        const unbind = audioNode(ci, (setVolume) => {
            let volume = 1;

            const updateVolumeIfNeeded = () => {
                const newVolume = getState(store).dos.volume;
                if (Math.abs(volume - newVolume) >= 0.05) {
                    setVolume(newVolume);
                    volume = newVolume;
                }
            };

            const unsubscribe = store.subscribe(updateVolumeIfNeeded);
            return unsubscribe;
        });

        return unbind;
    }, [ci]);
}

function usePause(ci: CommandInterface): void {
    const paused = useSelector((state: State) => state.dos.paused);
    const documentHidden = useSelector((state: State) => state.ui.documentHidden);
    useEffect(() => {
        (paused || documentHidden) ? ci.pause() : ci.resume();
    }, [paused, documentHidden, ci]);
}

function useStats(ci: CommandInterface): void {
    const dispatch = useDispatch();
    useEffect(() => {
        let prevCycles = 0;
        let prevNonSkippableSleepCount = 0;
        let prevSleepCount = 0;
        let prevSleepTime = KBD_0;
        let prevFrame = 0;
        let prevSound = 0;
        let prevMsgSent = 0;
        let prevMsgRecv = 0;
        let intervalStartedAt = Date.now();
        const intervalId = setInterval(() => {
            ci.asyncifyStats().then((stats) => {
                const dtMs = Date.now() - intervalStartedAt;
                const dtSec = dtMs / 1000;
                if (dtSec > 0) {
                    const dStats = {
                        cyclesPerMs: Math.round((stats.cycles - prevCycles) / dtMs),
                        nonSkippableSleepPreSec: Math.round((stats.nonSkippableSleepCount -
                            prevNonSkippableSleepCount) / dtSec),
                        sleepPerSec: Math.round((stats.sleepCount - prevSleepCount) / dtSec),
                        sleepTimePerSec: Math.round((stats.sleepTime - prevSleepTime) / dtSec),
                        framePerSec: Math.round((stats.messageFrame - prevFrame) / dtSec),
                        soundPerSec: Math.round((stats.messageSound - prevSound) / dtSec),
                        msgSentPerSec: Math.round((stats.messageSent - prevMsgSent) / dtSec),
                        msgRecvPerSec: Math.round((stats.messageReceived - prevMsgRecv) / dtSec),
                        netSent: stats.netSent,
                        netRecv: stats.netRecv,
                        driveSent: stats.driveSent,
                        driveRecv: stats.driveRecv,
                        driveRecvTime: stats.driveRecvTime,
                        driveCacheHit: stats.driveCacheHit,
                        driveCacheMiss: stats.driveCacheMiss,
                        driveCacheUsed: stats.driveCacheUsed,
                        driveBufferedAmount: stats.driveBufferedAmount,
                        driveIo: structuredClone(stats.driveIo),
                    };
                    dispatch(dosSlice.actions.stats(dStats));

                    prevCycles = stats.cycles;
                    prevNonSkippableSleepCount = stats.nonSkippableSleepCount;
                    prevSleepCount = stats.sleepCount;
                    prevSleepTime = stats.sleepTime;
                    prevFrame = stats.messageFrame;
                    prevSound = stats.messageSound;
                    prevMsgSent = stats.messageSent;
                    prevMsgRecv = stats.messageReceived;
                    intervalStartedAt = Date.now();
                }
            });
        }, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [dispatch, ci]);
}

function useLayers(canvas: HTMLCanvasElement, ci: CommandInterface) {
    const nsStore = useNonSerializableStore();
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const mirroredControls = useSelector((state: State) => state.dos.mirroredControls);
    const scaleControls = 1 + useSelector((state: State) => state.dos.scaleControls);
    const mouseSensitivity = 0.1 + useSelector((state: State) => state.dos.mouseSensitivity) * 3;
    const mobileControls = useSelector((state: State) => state.dos.mobileControls);
    const dispatch = useDispatch();
    let softKeyboard = useSelector((state: State) => state.dos.softKeyboard);
    function toggleKeyboard() {
        softKeyboard = !softKeyboard;
        dispatch(dosSlice.actions.softKeyboard(softKeyboard));
    }
    useEffect(() => {
        if (mobileControls) {
            if (nsStore.layers === null) {
                nsStore.layers = (async function() {
                    const layers = new Layers(canvas.parentElement as HTMLDivElement, canvas, toggleKeyboard, {});
                    const config = extractLayersConfig((await ci.config()).jsdosConf);

                    let activeLayer: string | undefined;
                    let layersConfig: LayersConfig | LegacyLayersConfig | null = null;
                    let unbindControls = () => { };
                    const instance: LayersInstance = {
                        config,
                        layers,
                        autolock: mouseCapture,
                        sensitivity: mouseSensitivity,
                        mirroredControls,
                        scaleControls,
                        activeLayer: activeLayer,
                        getActiveConfig: () => layersConfig,
                        setActiveConfig: (config: LayersConfig | LegacyLayersConfig | null, layerName?: string) => {
                            layersConfig = config;
                            activeLayer = layerName;
                            unbindControls();

                            if (config === null) {
                                unbindControls = () => { };
                                layers.mouseOverlay.style.display = "none";
                            } else if (config.version === undefined) {
                                layers.mouseOverlay.style.display = "block";
                                unbindControls = initLegacyLayersControl(instance, layers,
                                    config as LegacyLayersConfig, ci);
                            } else {
                                layers.mouseOverlay.style.display = "block";
                                unbindControls = initLayersControl(layers, config as LayersConfig,
                                    ci, instance, instance.mirroredControls, instance.scaleControls,
                                    layerName);
                            }
                        },
                    };

                    instance.setActiveConfig(config);
                    return instance;
                })();
                nsStore.layers.catch(console.error);
            } else {
                nsStore.layers.then((instance) => {
                    instance.autolock = mouseCapture;
                    instance.sensitivity = mouseSensitivity;
                    instance.mirroredControls = mirroredControls;
                    instance.scaleControls = scaleControls;
                    instance.setActiveConfig(instance.getActiveConfig() ?? instance.config, instance.activeLayer);
                });
            }
        } else if (nsStore.layers !== null) {
            nsStore.layers.then((l) => l.setActiveConfig(null));
        }
    }, [ci, mouseCapture, mouseSensitivity, mobileControls, mirroredControls, scaleControls]);
};
