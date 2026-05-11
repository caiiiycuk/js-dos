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
import { AsyncifyStats } from "emulators/dist/types/protocol/protocol";
import { offscreenCanvas } from "./render/offscreen";

export function useDosRuntime(canvas: HTMLCanvasElement,
                              ci: CommandInterface): void {
    useLog(ci);
    useCpuControl(ci);
    useRenderImage(canvas);
    useStats(ci);
    usePause(ci);
    useKeyboard(ci);
    useMouse(canvas, ci);
    useLayers(canvas, ci);
    useRenderBackend(canvas, ci);
    useAudioBackend(ci);
}

function useCpuControl(ci: CommandInterface): void {
    const fastForward = useSelector((state: State) => state.dos.fastForward);
    const frameSkip = useSelector((state: State) => state.dos.frameSkip);
    const cpuAuto = useSelector((state: State) => state.dos.cpuAuto);
    const speed = useSelector((state: State) => state.dos.speed);
    const fastForwardOnBoot = useSelector((state: State) => state.dos.fastForwardOnBoot);
    const withSockdrive = useSelector((state: State) => state.dos.withSockdrive);
    let cycles = parseInt(useSelector((state: State) => state.dos.cycles));

    if (isNaN(cycles) || cycles < 3000 || cycles > 1000000) {
        cycles = 0;
    }

    useEffect(() => {
        if (fastForwardOnBoot > 0 && withSockdrive) {
            const intervalId = setInterval(() => {
                ci.sendBackendEvent({
                    type: "wc-trigger-event",
                    event: "fast_forward:1",
                });
            }, 300);
            setTimeout(() => {
                clearInterval(intervalId);
                ci.sendBackendEvent({
                    type: "wc-trigger-event",
                    event: "fast_forward:0",
                });
            }, fastForwardOnBoot * 1000);
        }
    }, [ci, fastForwardOnBoot, withSockdrive]);

    useEffect(() => {
        if ((ci as any).canSetFastForward) {
            ci.sendBackendEvent({
                type: "wc-trigger-event",
                event: "fast_forward:" + (fastForward ? "1" : "0"),
            });
        } else {
            (ci as any).canSetFastForward = true;
        }
    }, [ci, fastForward]);

    useEffect(() => {
        if ((ci as any).canSetFrameSkip) {
            ci.sendBackendEvent({
                type: "wc-trigger-event",
                event: "frame_skip:" + frameSkip,
            });
        } else {
            (ci as any).canSetFrameSkip = true;
        }
    }, [ci, frameSkip]);

    useEffect(() => {
        if ((ci as any).canAdjustCpu) {
            ci.sendBackendEvent({
                type: "wc-trigger-event",
                event: "auto_adjust:" + (cpuAuto ? "1" : "0"),
            });
        } else {
            (ci as any).canAdjustCpu = true;
        }
    }, [ci, cpuAuto]);

    useEffect(() => {
        if ((ci as any).canSetCycles && cycles > 0) {
            ci.sendBackendEvent({
                type: "wc-trigger-event",
                event: "cycles:" + cycles,
            });
        } else {
            (ci as any).canSetCycles = true;
        }
    }, [ci, cycles]);

    useEffect(() => {
        if ((ci as any).canSetSpeed) {
            ci.sendBackendEvent({
                type: "wc-trigger-event",
                event: "speed:" + speed,
            });
        } else {
            (ci as any).canSetSpeed = true;
        }
    }, [ci, speed]);
}

function useLog(ci: CommandInterface): void {
    const dispatch = useDispatch();
    useEffect(() => {
        ci.events().onMessage((msgType, ...args: string[]) => {
            if (msgType === "error" && args[0]?.startsWith("[panic]")) {
                dispatch(uiSlice.actions.showToast({
                    message: args[0],
                    intent: "panic",
                }));
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
    const mouseSensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    useEffect(() => {
        if (!mobileControls) {
            return mouse(mouseCapture, mouseSensitivity, 0, canvas, ci);
        }
    }, [canvas, ci, mouseCapture, mouseSensitivity, mobileControls]);
}

function useKeyboard(ci: CommandInterface): void {
    const dispatch = useDispatch();
    const dosboxX = useSelector((state: State) => state.dos.backend) === "dosboxX";
    const paused = useSelector((state: State) => state.dos.paused);
    useEffect(() => {
        return keyboard(window as any, ci, dosboxX, dispatch, paused);
    }, [ci, dosboxX, dispatch, paused]);
}

function useRenderBackend(canvas: HTMLCanvasElement,
                          ci: CommandInterface): void {
    const nonSerializableStore = useNonSerializableStore();
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

        if (nonSerializableStore.offscreenCanvas) {
            unbind = offscreenCanvas(canvas, ci, aspect);
        } else if (renderBackend === "canvas") {
            unbind = canvasRender(canvas, ci, aspect);
        } else {
            try {
                unbind = webglRender(canvas, ci, nonSerializableStore, aspect);
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
    const t = useT();

    useEffect(() => {
        let prevNonSkippableSleepCount = 0;
        let prevSleepCount = 0;
        let prevSleepTime = KBD_0;
        let prevFrame = 0;
        let prevSound = 0;
        let prevMsgSent = 0;
        let prevMsgRecv = 0;
        let intervalStartedAt = Date.now();
        const intervalId = setInterval(() => {
            ci.asyncifyStats().then((stats: AsyncifyStats) => {
                const dtMs = Date.now() - intervalStartedAt;
                const dtSec = dtMs / 1000;
                if (dtSec > 0) {
                    const dStats = {
                        cpuMetrics: stats.cpuMetrics ?? null,
                        glfx: stats.glfx ?? false,
                        offscreenCanvas: stats.offscreenCanvas ?? false,
                        cycles: 0,
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
                        driveIo: structuredClone(stats.driveIo) ?? [],
                    };
                    dispatch(dosSlice.actions.stats(dStats));

                    if (dStats.driveIo.length > 0) {
                        let message = t("preloading_sockdrive");
                        let showToast = false;
                        for (let i = 0; i < dStats.driveIo.length; i++) {
                            const drive = dStats.driveIo[i];
                            const progress = Math.min(100, Math.round(drive.read * 100 / drive.preload));
                            message += " " + (i === 0 ? "C: " : ", D: ") + " " + progress + "%";
                            showToast = showToast || progress < 100;
                        };
                        if (showToast) {
                            dispatch(uiSlice.actions.showToast({
                                message,
                                long: true,
                            }));
                        }
                    }

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
        }, 1000);

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
