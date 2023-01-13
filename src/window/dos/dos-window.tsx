import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { dosSlice, nonSerializedDosState, RenderBackend } from "../../store/dos";
import { State } from "../../store";
import { keyboard } from "./controls/keyboard";
import { webGl as webglRender } from "./render/webgl";
import { canvas as canvasRender } from "./render/canvas";

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

function useDosRuntime(canvas: HTMLCanvasElement | null, ci: CommandInterface | null) {
    if (canvas === null || ci === null) {
        return;
    }

    const renderBackend = useSelector((state: State) => state.dos.renderBackend);
    const renderAspect = useSelector((state: State) => state.dos.renderAspect);

    let aspect = undefined;
    switch (renderAspect) {
        case "4/3": aspect = 4/3; break;
        case "16/10": aspect = 16/10; break;
        default:
    }

    useKeyboard(ci);
    useRenderBackend(renderBackend, canvas, ci, aspect);

    return null;
}

function useKeyboard(ci: CommandInterface) {
    const unbind = keyboard(window as any, ci);

    return () => {
        unbind();
    };
}

function useRenderBackend(renderBackend: RenderBackend,
                          canvas: HTMLCanvasElement,
                          ci: CommandInterface,
                          forceAspect?: number) {
    let unbind = () => { };

    if (renderBackend === "canvas") {
        unbind = canvasRender(canvas, ci, forceAspect);
    } else {
        try {
            unbind = webglRender(canvas, ci, forceAspect);
        } catch (e) {
            console.error("Unalbe to start webgl render", e);
            unbind = canvasRender(canvas, ci, forceAspect);
        }
    }

    return () => {
        unbind();
    };
}
