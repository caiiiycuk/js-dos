import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { dosSlice, nonSerializedDosState } from "../../dos";
import { State } from "../../store";
import { webGl } from "./render/webgl";

declare const emulators: Emulators;

export function DosWindow(props: {
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);
    const worker = useSelector((state: State) => state.dos.worker);
    const backend = useSelector((state: State) => state.dos.backend);
    const dispatch = useDispatch();

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

    useEffect(() => {
        if (ci === null) {
            return;
        }

        const root = rootRef.current;
        if (root === null) {
            return;
        }

        const canvas = root.childNodes[0] as HTMLCanvasElement;

        const unmount = webGl(canvas, ci);
        return unmount;
    }, [ci !== null]);

    return <div ref={rootRef} class="h-full flex-grow overflow-hidden relative">
        <canvas/>
    </div>;
}
