import { useDispatch, useSelector } from "react-redux";
import { dosSlice, FitConstant } from "../../store/dos";
import { State, store } from "../../store";
import { CommandInterface } from "emulators";
import { keyboard } from "./controls/keyboard";
import { webGl as webglRender } from "./render/webgl";
import { canvas as canvasRender } from "./render/canvas";
import { audioNode } from "./sound/audio-node";
import { useEffect } from "preact/hooks";
import { mouse } from "./controls/mouse";
import { KBD_0 } from "./controls/keys";
import { uiSlice } from "../../store/ui";

export function useDosRuntime(canvas: HTMLCanvasElement,
                              ci: CommandInterface): void {
    useLog(ci);
    useRenderImage(canvas);
    useStats(ci);
    usePause(ci);
    useKeyboard(ci);
    useMouse(canvas, ci);
    useRenderBackend(canvas, ci);
    useAudioBackend(ci);
}

function useLog(ci: CommandInterface): void {
    const dispatch = useDispatch();
    useEffect(() => {
        ci.events().onMessage((msgType, ...args) => {
            if (msgType === "error" && args[0]?.startsWith("[panic]")) {
                dispatch(uiSlice.actions.showToast({
                    message: args[0],
                    intent: "panic",
                }));
            } else if (msgType === "log" && args[0]?.indexOf("sockdrive:") !== -1) {
                dispatch(uiSlice.actions.cloudSaves(false));
                if (args[0]?.indexOf("write=false") !== -1) {
                    dispatch(uiSlice.actions.readOnlyWarning(true));
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
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const mouseSensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    useEffect(() => {
        const sensistiviy = 0.1 + mouseSensitivity * 3;
        return mouse(mouseCapture, sensistiviy, 0, canvas, ci);
    }, [canvas, ci, mouseCapture, mouseSensitivity]);
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
    useEffect(() => {
        const unbind = audioNode(ci, (setVolume) => {
            let volume = 1;

            const updateVolumeIfNeeded = () => {
                const newVolume = store.getState().dos.volume;
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
    useEffect(() => {
        paused ? ci.pause() : ci.resume();
    }, [paused, ci]);
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
