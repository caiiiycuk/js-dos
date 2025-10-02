/* eslint-disable max-len */
import { useDispatch, useSelector } from "react-redux";
import { State, useNonSerializableStore } from "../store";
import { uiSlice } from "../store/ui";
import { useT } from "../i18n";

export function StatsFrame() {
    const nonSerializableStore = useNonSerializableStore();
    const backend = useSelector((state: State) => state.dos.backend);
    const hardware = useSelector((state: State) => state.dos.backendHardware) &&
        nonSerializableStore.options.backendHardware;
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);
    const startedAt = useSelector((state: State) => state.dos.ciStartedAt);
    const stats = useSelector((state: State) => state.dos.stats);
    const cycles = Math.round(useSelector((state: State) => state.dos.stats.cyclesPerMs) / 1000);
    const startIpxServer = useSelector((state: State) => state.dos.startIpxServer);
    const dispatch = useDispatch();
    const t = useT();
    return <div class="stats-frame frame-root items-start px-4">
        <div class="text-center mb-2 text-xs">
            js-dos/emu: {JSDOS_VERSION}/{emuVersion}
        </div>
        <div class="w-full overflow-x-auto">
            <table class="table table-compact w-full">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Emulation</td>
                        <td>{backend + " " + (hardware ? "(WS)" : "(WA)")}</td>
                    </tr>
                    <tr>
                        <td>Offscreen Canvas</td>
                        <td>{stats.offscreenCanvas ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td>Glide GL (3D)</td>
                        <td>{stats.glfx ? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td>Uptime</td>
                        <td>{Math.round((Date.now() - startedAt) / 100) / 10} s</td>
                    </tr>
                    <tr>
                        <td>Cycles/ms</td>
                        {cycles <= 0 && <td>~ K</td>}
                        {cycles > 0 && cycles <= 1000 && <td>{cycles} K</td>}
                        {cycles > 1000 && <td>{Math.round(cycles / 1000)} KK</td>}
                    </tr>
                    <tr>
                        <td>NonSkipSleep COUNT/s</td>
                        <td>{stats.nonSkippableSleepPreSec}</td>
                    </tr>
                    <tr>
                        <td>Sleep COUNT/s</td>
                        <td>{stats.sleepPerSec}</td>
                    </tr>
                    <tr>
                        <td>Sleep TIME/s</td>
                        <td>{stats.sleepTimePerSec}</td>
                    </tr>
                    <tr>
                        <td>Msg FRAME/s</td>
                        <td>{stats.framePerSec}</td>
                    </tr>
                    <tr>
                        <td>Msg SOUND/s</td>
                        <td>{stats.soundPerSec}</td>
                    </tr>
                    <tr>
                        <td>Msg SENT/s</td>
                        <td>{stats.msgSentPerSec}</td>
                    </tr>
                    <tr>
                        <td>Msg RECV/s</td>
                        <td>{stats.msgRecvPerSec}</td>
                    </tr>
                    <tr>
                        <td>Net Id</td>
                        <td>
                            {startIpxServer && <div class="flex items-center gap-2 justify-between">
                                {nonSerializableStore.net?.peerId ?? "-"}
                                <button class="btn btn-sm btn-ghost btn-square" onClick={() => {
                                    navigator.clipboard.writeText((nonSerializableStore.net?.peerId ?? "-").toString());
                                    dispatch(uiSlice.actions.showToast({
                                        message: t("copied"),
                                        intent: "success",
                                    }));
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                        stroke="currentColor" class="size-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504
                                            1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125
                                            1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504
                                            1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621
                                            0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12
                                            6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375
                                            3.375 0 0 0-3.375-3.375H9.75" />
                                    </svg>
                                </button>
                            </div>}
                            {!startIpxServer && <p>-</p>}
                        </td>
                    </tr>
                    <tr>
                        <td>Net SENT</td>
                        <td>{Math.round(stats.netSent / 1024 * 100) / 100}Kb</td>
                    </tr>
                    <tr>
                        <td>Net RECV</td>
                        <td>{Math.round(stats.netRecv / 1024 * 100) / 100}Kb</td>
                    </tr>
                    {stats.driveIo.map((info, i) => {
                        return <>
                            <tr>
                                <td>HDD {i == 0 ? "C:" : "D:"}</td>
                                <td>{info.url.substring(info.url.lastIndexOf("/") + 1)} -
                                    {Math.round(info.read * 100 / info.total)}%</td>
                            </tr>
                            <tr>
                                <td>Size</td>
                                <td>{Math.round(info.total / 1024 / 1024)} Mb <br />
                                    {Math.round(info.write / 1024)} Kb</td>
                            </tr>
                        </>;
                    })}
                </tbody>
            </table>
        </div>
    </div>;
}
