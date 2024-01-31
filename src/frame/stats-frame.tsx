import { useSelector } from "react-redux";
import { State } from "../store";

export function StatsFrame() {
    const stats = useSelector((state: State) => state.dos.stats);
    const cycles = Math.round(useSelector((state: State) => state.dos.stats.cyclesPerMs) / 1000);
    const driveRecvMb = Math.round(stats.driveRecv / 1024 / 1024 * 100) / 100;
    const driveSpeedMb = (stats.driveRecvTime / 1000) > 1 ?
        Math.round(driveRecvMb / stats.driveRecvTime * 1000 * 100) / 100 : 0;
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
                        { cycles <= 0 && <td>~ K</td> }
                        { cycles > 0 && cycles <= 1000 && <td>{cycles} K</td> }
                        { cycles > 1000 && <td>{Math.round(cycles / 1000)} KK</td> }
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
                        <td>Net SENT/s</td>
                        <td>{Math.round(stats.netSent / 1024 * 100) / 100}Kb</td>
                    </tr>
                    <tr>
                        <td>Net RECV/s</td>
                        <td>{Math.round(stats.netRecv / 1024 * 100) / 100}Kb</td>
                    </tr>
                    <tr>
                        <td>HDD RECV/s</td>
                        <td>{driveRecvMb}Mb (~{driveSpeedMb}Mb/s)</td>
                    </tr>
                    <tr>
                        <td>HDD SENT/s</td>
                        <td>{Math.round(stats.driveSent / 1024 / 1024 * 100) / 100}Mb</td>
                    </tr>
                    <tr>
                        <td>HDD Cache</td>
                        <td>{Math.round(stats.driveCacheUsed / 1024 / 1024 * 100) / 100}Mb</td>
                    </tr>
                    <tr>
                        <td>HDD Cache Hit/Miss</td>
                        <td>{stats.driveCacheHit} / {stats.driveCacheMiss}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>;
}
