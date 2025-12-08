import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { useEffect, useState } from "preact/hooks";
import { CPUMetrics } from "emulators/dist/types/protocol/protocol";
import { dosSlice } from "../store/dos";

const cpuSpeedMin = 50;
const cpuSpeedMax = 250;

export function TurboFrame() {
    const dispatch = useDispatch();
    const [cpuMetrics, setCpuMetrics] = useState<CPUMetrics | null>(null);
    const newMetrics = useSelector((state: State) => state.dos.stats.cpuMetrics);
    const fastForward = useSelector((state: State) => state.dos.fastForward);
    const frameSkip = useSelector((state: State) => state.dos.frameSkip);
    const cpuAuto = useSelector((state: State) => state.dos.cpuAuto);
    const cycles = useSelector((state: State) => state.dos.cycles);
    const speed = useSelector((state: State) => state.dos.speed);

    useEffect(() => {
        if (newMetrics) {
            setCpuMetrics(newMetrics);
        }
    }, [newMetrics]);

    if (!cpuMetrics) {
        return null;
    }

    const ratio = cpuMetrics.ratio.reduce((a, b) => a + b, 0) / cpuMetrics.ratio.length;
    const newCmax = cpuMetrics.newCmax.reduce((a, b) => a + b, 0) / cpuMetrics.newCmax.length;
    const ticksDone = cpuMetrics.ticksDone.reduce((a, b) => a + b, 0) / cpuMetrics.ticksDone.length;
    const ticksScheduled = cpuMetrics.ticksScheduled.reduce((a, b) => a + b, 0) / cpuMetrics.ticksScheduled.length;
    const cpuLoad = ticksDone / ticksScheduled;
    const speedDisabled = !(cpuAuto && cpuMetrics.cpuAuto);

    return <div class="turbo-frame frame-root items-start px-4">
        <div class="flex flex-col gap-4 w-full text-sm">
            {cpuMetrics.emulatorSpeed > 0 && <div class="flex flex-col gap-2 mb-8">
                <p>Speed</p>
                <input type="range" min={cpuSpeedMin} max={cpuSpeedMax}
                    value={speed} step={5} class={"range range-sm " + (speedDisabled ? "opacity-20" : "")}
                    onChange={(e: any) => dispatch(dosSlice.actions.speed(Number(e.target.value)))}
                    disabled={speedDisabled} />
                <div class="flex justify-between px-2.5 mt-2 text-xs">
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                    <span>|</span>
                </div>
                <div class="flex justify-between px-2.5 mt-2 text-xs">
                    <span>{cpuSpeedMin}%</span>
                    <span>{Math.round(cpuSpeedMin + (cpuSpeedMax - cpuSpeedMin) * 0.25)}%</span>
                    <span>{Math.round(cpuSpeedMin + (cpuSpeedMax - cpuSpeedMin) * 0.5)}%</span>
                    <span>{Math.round(cpuSpeedMin + (cpuSpeedMax - cpuSpeedMin) * 0.75)}%</span>
                    <span>{cpuSpeedMax}%</span>
                </div>
            </div>}

            {!cpuAuto && <div class="flex flex-row gap-2 items-center justify-between">
                <p>Cycles</p>
                <input type="text" class="input input-sm" value={cycles} onChange={(e: any) =>
                    dispatch(dosSlice.actions.cycles(e.target.value))} />
            </div>}
            <div class="grid2">
                <div class="value">
                    <p>Speed</p>
                    <p>{cpuMetrics.emulatorSpeed > 0 ? Math.round(cpuMetrics.emulatorSpeed * 100) : "100"}%</p>
                </div>
                <div class="value">
                    <p>Fast Forward</p>
                    <input type="radio" class={"radio radio-sm " + (cpuMetrics.fastForward ? "radio-accent" : "")}
                        checked={fastForward} onClick={() => dispatch(dosSlice.actions.fastForward(!fastForward))} />
                </div>
                <div class="value">
                    <p>Frame Skip</p>
                    <input type="radio" class={"radio radio-sm " + (cpuMetrics.frameSkip > 0 ? "radio-accent" : "")}
                        checked={frameSkip > 0}
                        onClick={() => dispatch(dosSlice.actions.frameSkip(frameSkip > 0 ? 0 : 2))} />
                </div>
                <div class="value">
                    <p>Auto Adjust</p>
                    <input type="radio" class={"radio radio-sm " + (cpuMetrics.cpuAuto ? "radio-accent" : "")}
                        checked={cpuAuto} disabled={false} onClick={() => {
                            dispatch(dosSlice.actions.cpuAuto(!cpuAuto));
                            if (cpuAuto) {
                                dispatch(dosSlice.actions.speed(100));
                                dispatch(dosSlice.actions.cycles(cycles));
                            }
                        }} />
                </div>
            </div>
            <div class="grid2">
                <div class="value">
                    <p>Cycles</p>
                    <p>{Math.round(cpuMetrics.cpuMax)}</p>
                </div>
                <div class="value">
                    <p>CPU Load</p>
                    <p>{Math.round(cpuLoad * 100)}%</p>
                </div>
            </div>
            <div class="grid2">
                <div class="value">
                    <p>Sockdrive</p>
                    <input type="radio" class={"radio radio-sm " + (cpuMetrics.cpuSockdrive ? "radio-error" : "")}
                        checked={cpuMetrics.cpuSockdrive} disabled={true} />
                </div>
                <div class="value">
                    <p>Auto skip</p>
                    <input type="radio" class={"radio radio-sm " + (cpuMetrics.cpuSkip ? "radio-accent" : "")}
                        checked={cpuMetrics.cpuSkip} disabled={true} />
                </div>
                <div></div>
                <div class="value">
                    <p>CPU Used</p>
                    <p>{Math.round(cpuMetrics.cpuUsed * 100)}%</p>
                </div>
            </div>
            <div class="grid2">
                <div class="value">
                    <p>Ratio</p>
                    <p>{ratio.toFixed(2)}</p>
                </div>
                <div class="value">
                    <p>Cmax</p>
                    <p>{Math.round(newCmax)}</p>
                </div>
                <div class="value">
                    <p>Scheduled</p>
                    <p>{Math.round(ticksScheduled)}</p>
                </div>
                <div class="value">
                    <p>Done</p>
                    <p>{Math.round(ticksDone)}</p>
                </div>
            </div>
            <p class="text-sm">Sleep pattern</p>
            <div class="rounded-box bg-base-200 p-4 w-full h-24">
                <p class="text-micro overflow-y-hidden">
                    {cpuMetrics.sleepPattern.substring(0, 256)}
                </p>
            </div>
        </div>
    </div>;
}
