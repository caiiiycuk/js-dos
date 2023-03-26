import { CommandInterface } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import { State } from "../../store";

export const dhry2Bundle = "/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos";

export function Dhry2Results(props: { ci: CommandInterface }) {
    const ci = props.ci;
    const backend = useSelector((state: State) => state.dos.backend);
    const worker = useSelector((state: State) => state.dos.worker);

    const [results, setResults] = useState<{
        runs: number,
        time: number,
        vax: number,
        pc: string | null,
    }>({
        runs: 0,
        time: 0,
        vax: 0,
        pc: null,
    });

    const [stats, setStats] = useState<{sleepPerSec: number, cyclesPerMs: number}>({
        sleepPerSec: 0,
        cyclesPerMs: 0,
    });

    useEffect(() => {
        const listeners: ((message: string) => void)[] = [];

        ci.events().onStdout((message: string) => {
            for (const next of listeners) {
                next(message);
            }
        });

        const oldStdoutFn = ci.events().onStdout;
        ci.events().onStdout = (fn: (message: string) => void) => {
            listeners.push(fn);
        };

        // listen program outpus for `~>dtime` marker
        let startedAt = Date.now();
        let prevSleepCount = 0;
        let prevCycles = 0;
        ci.events().onStdout((message) => {
            if (!message.startsWith("dhry2:")) {
                return;
            }

            ci.asyncifyStats().then((stats) => {
                const dt = Date.now() - startedAt;
                setStats({
                    sleepPerSec: Math.round((stats.sleepCount - prevSleepCount) * 1000 / dt),
                    cyclesPerMs: Math.round((stats.cycles - prevCycles) / dt),
                });
                startedAt = Date.now();
                prevSleepCount = stats.sleepCount;
                prevCycles = stats.cycles;
            });

            // eslint-disable-next-line
            const [_, runsStr, deltaStr, vaxRatingStr] = message.split(" ");
            const runs = Number.parseInt(runsStr);
            const delta = Number.parseFloat(deltaStr);
            const vaxRating = Number.parseFloat(vaxRatingStr);

            if (delta >= 5000) {
                setResults({
                    runs,
                    time: Math.round(delta * 10) / 10,
                    vax: Math.round(vaxRating * 100) / 100,
                    pc: getComparablePc(vaxRating),
                });
            } else {
                setResults({
                    runs,
                    time: Math.round(delta * 10) / 10,
                    vax: Math.round(vaxRating * 100) / 100,
                    pc: null,
                });
            }
        });

        return () => {
            ci.events().onStdout = oldStdoutFn;
        };
    }, [ci]);

    return <div class="dhry2-window">
        <div class="title">Dhrystone 2 Benchmark</div>
        <div class="backend">Backend: {backend + "-" + (worker ? "worker" : "direct")}</div>
        <div class="results">
            <div>VAX:</div>
            <div>{results.vax}</div>
            <div>Cycles p/ms:</div>
            <div>{stats.cyclesPerMs}</div>
            <div>Sleep p/sec:</div>
            <div>{stats.sleepPerSec}</div>
            <div>Runs:</div>
            <div>{results.runs}</div>
            <div>Time:</div>
            <div>{results.time} <span>ms</span></div>
            {results.pc !== null && <div>PC:</div>}
            {results.pc !== null && <div>{results.pc ?? "..."}</div>}
        </div>
    </div>;
}


function getComparablePc(vax: number): string {
    let index = 0;
    while ((index * 2 + 1) < results.length) {
        if (results[index * 2 + 1] as number >= vax) {
            break;
        }

        index++;
    }

    index = Math.min((results.length / 2 - 1), index);
    return (results[index * 2] + "").trim();
}

// Reuslts from
// http://www.roylongbottom.org.uk/dhrystone%20results.htm
const results = [
    "AMD 80386 40MHz", 13.7,
    "IBM 486D2 50MHz", 22.4,
    "80486 DX2 66MHz", 35.3,
    "IBM 486BL 100MHz", 40.9,
    "AMD 5X86 133MHz", 84.5,
    "Pentium 75MHz", 87.1,
    "Cyrix P150 120MHz", 160,
    "Pentium 100MHz", 122,
    "Cyrix PP166 133MHz", 180,
    "IBM 6x86 150MHz", 188,
    "Pentium 133MHz", 181,
    "Pentium 166MHz", 189,
    "Cyrix PR233 188MHz", 232,
    "Pentium 200MHz", 269,
    "Pentium MMX 200MHz", 276,
    "AMD K6 200MHz", 289,
    "Pentium Pro 200MHz", 312,
    "Celeron A 300MHz", 484,
    "Pentium II 300MHz", 477,
    "AMD K62 500MHz", 606,
    "AMD K63 450MHz", 645,
    "Pentium II 450MHz", 713,
    "Celeron A 450MHz", 720,
    "Pentium III 450MHz", 722,
    "Pentium III 600MHz", 959,
    "Athlon 600MHz", 942,
    "Duron 600MHz", 999,
    "Pentium III 1000MHz", 1595,
    "PIII Tualatin 1200MHz", 1907,
    "Pentium 4 1700MHz", 1843,
    "Athlon Tbird 1000MHz", 1659,
    "Duron 1000MHz", 1674,
    "Celeron M 1295MHz", 2273,
    "Atom 1600MHz", 1828,
    "Pentium 4 1900MHz", 2003,
    "Atom 1666MHz", 1948,
    "P4 Xeon 2200MHz", 2265,
    "Atom Z8300 1840MHz", 2686,
    "Athlon 4 1600MHz", 2830,
    "Pentium M 1862MHz", 3933,
    "Ath4 Barton 1800MHz", 3172,
    "Pentium 4E 3000MHz", 3553,
    "Athlon XP 2080MHz", 3700,
    "Turion 64 M 1900MHz", 3742,
    "Pentium 4 3066MHz", 4012,
    "Opteron 1991MHz", 3985,
    "Core 2 Duo M 1830MHz", 4952,
    "Athlon XP 2338MHz", 4160,
    "Athlon 64 2150MHz", 4288,
    "Pentium 4 3678MHz", 4227,
    "Athlon 64 2211MHz", 4462,
    "Celeron C2 M 2000MHz", 5275,
    "Core 2 Duo 1 CP 2400MHz", 6446,
    "Core i5 2467M 2300MHz", 4752,
    "Phenom II 1 CP 3000MHz", 7615,
    "Core i7 930 3066MHz", 8684,
    "Core i7 860 3460MHz", 9978,
    "Core i7 3930K 3800MHz", 11197,
    "Core i7 4820K 3900MHz", 11867,
    "Core i7 4820K 3900MHz", 11978,
    "Core i7 3930K", 13877,
];
