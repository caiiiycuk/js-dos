import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { dosSlice, nonSerializedDosState } from "../../store/dos";
import { State } from "../../store";
import { useDosRuntime } from "./dos-runtime";

declare const emulators: Emulators;

export function DosWindow(props: {
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);
    const worker = useSelector((state: State) => state.dos.worker);
    const backend = useSelector((state: State) => state.dos.backend);
    const dispatch = useDispatch();
    const canvas = rootRef.current?.childNodes[0] as HTMLCanvasElement | null;

    useEffect(() => {
        try {
            const ci: Promise<CommandInterface> =
                (emulators as any)[backend + (worker ? "Worker" : "Direct")](nonSerializedDosState.bundle!);
            ci
                .then(setCi)
                .catch((e) => dispatch(dosSlice.actions.emuError(e.message)));

            return () => {
                ci.then((ci) => ci.exit());
            };
        } catch (e) {
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    }, [worker, backend]);

    useDosRuntime(canvas, ci);

    return <div ref={rootRef} class="h-full flex-grow overflow-hidden relative">
        <canvas />
    </div>;
}
