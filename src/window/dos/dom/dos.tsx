import { Emulators } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import { State } from "../../../store";
import { DosLoading } from "./dos-loading";
import { DosPlayer } from "./dos-player";

declare const emulators: Emulators;


export function DosWindow(props: {}) {
    const frameOpened = useSelector((state: State) => state.ui.frame) !== "none";
    return <div class="absolute w-full h-full bg-red-600 flex flex-row">
        <div class={ frameOpened ? "w-96" : "w-12" }></div>
        <Dos/>
    </div>;
}

export function Dos(props: { class?: string }) {
    const loaded = false; // useSelector((state: State) => state.dos.loaded);
    const [impl, setImpl] = useState<Emulators | null>(null);

    useEffect(() => {
        if (loaded) {
            setImpl(emulators);
        }
    }, [loaded]);

    if (impl === null) {
        return <DosLoading />;
    }

    return <DosPlayer emulators={emulators} />;
}

