import { useSelector } from "react-redux";
import { State } from "../store";

export function StatsFrame() {
    const stats = useSelector((state: State) => state.dos.stats);
    return <div class="stats-frame frame-root items-start px-4">
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
                        <td>Cycles/ms</td>
                        <td>{stats.cyclesPerMs / 1000}K</td>
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
                </tbody>
            </table>
        </div>
    </div>;
}
