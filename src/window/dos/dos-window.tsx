import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { dosSlice } from "../../store/dos";
import { nonSerializableStore, postJsDosEvent } from "../../non-serializable-store";
import { State } from "../../store";
import { useDosRuntime } from "./dos-runtime";
import { dhry2Bundle, Dhry2Results } from "./dos-dhry2";
import { createWsTransportLayer } from "../../ws/ws-transport-layer";

declare const emulators: Emulators;

export function DosWindow(props: {
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);
    const token = useSelector((state: State) => state.auth.account?.token.access_token);
    const worker = useSelector((state: State) => state.dos.worker);
    const backend = useSelector((state: State) => state.dos.backend);
    const backendHardware = useSelector((state: State) => state.dos.backendHardware);
    const dispatch = useDispatch();

    useEffect(() => {
        try {
            const bundles = nonSerializableStore.loadedBundle!.bundleChanges !== null ?
                [nonSerializableStore.loadedBundle!.bundle, nonSerializableStore.loadedBundle!.bundleChanges] :
                nonSerializableStore.loadedBundle!.bundle;

            nonSerializableStore.loadedBundle!.bundle = null;
            nonSerializableStore.loadedBundle!.bundleChanges = null;

            const ci: Promise<CommandInterface> = (async () => {
                if (backendHardware && nonSerializableStore.options.backendHardware) {
                    const ws = await nonSerializableStore.options.backendHardware(backend);
                    if (ws !== null) {
                        return emulators.backend(bundles as any, await createWsTransportLayer(ws), { token });
                    }
                }

                return (emulators as any)[backend + (worker ? "Worker" : "Direct")](bundles, {
                    token,
                });
            })();

            ci
                .then((ci) => {
                    setCi(ci);
                    dispatch(dosSlice.actions.ci(true));
                    nonSerializableStore.ci = ci;
                    postJsDosEvent("ci-ready", ci);
                    (window as any).ci = ci;
                })
                .catch((e) => dispatch(dosSlice.actions.emuError(e.message)));

            return () => {
                ci.then((ci) => {
                    dispatch(dosSlice.actions.ci(false));
                    nonSerializableStore.ci = null;
                    ci.exit();
                });
            };
        } catch (e) {
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    }, [worker, backend, token ?? null]);

    return <div class="bg-black h-full flex-grow overflow-hidden relative">
        <canvas ref={canvasRef} />
        {canvasRef.current && ci && <DosRuntime canvas={canvasRef.current} ci={ci} />}
    </div>;
}

function DosRuntime(props: { canvas: HTMLCanvasElement, ci: CommandInterface }) {
    const { canvas, ci } = props;
    const bundle = useSelector((state: State) => state.dos.bundle);

    useDosRuntime(canvas, ci);

    return <>
        {bundle?.endsWith(dhry2Bundle) && <Dhry2Results ci={ci} />}
    </>;
}
