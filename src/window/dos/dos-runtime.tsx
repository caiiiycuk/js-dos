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

export function useDosRuntime(canvas: HTMLCanvasElement,
                              ci: CommandInterface): void {
    useStats(ci);
    usePause(ci);
    useKeyboard(ci);
    useMouse(canvas, ci);
    useRenderBackend(canvas, ci);
    useAudioBackend(ci);
}

function useMouse(canvas: HTMLCanvasElement,
                  ci: CommandInterface): void {
    const mouseLock = useSelector((state: State) => state.dos.mouseLock);
    const mouseSensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    useEffect(() => {
        const sensistiviy = 0.5 + mouseSensitivity * 7;
        return mouse(mouseLock, sensistiviy, 0, canvas, ci);
    }, [canvas, ci, mouseLock, mouseSensitivity]);
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
        let prevSleepCount = 0;
        let intervalStartedAt = Date.now();
        const intervalId = setInterval(() => {
            ci.asyncifyStats().then((stats) => {
                const dt = Date.now() - intervalStartedAt;

                dispatch(dosSlice.actions.stats({
                    sleepPerSec: Math.round((stats.sleepCount - prevSleepCount) * 1000 / dt),
                    cyclesPerMs: Math.round((stats.cycles - prevCycles) / dt),
                }));

                prevCycles = stats.cycles;
                prevSleepCount = stats.sleepCount;
                intervalStartedAt = Date.now();
            });
        }, 3000);

        return () => {
            clearInterval(intervalId);
        };
    }, [dispatch, ci]);
}
