import { useSelector } from "react-redux";
import { FitConstant, RenderBackend } from "../../store/dos";
import { State } from "../../store";
import { CommandInterface } from "emulators";
import { keyboard } from "./controls/keyboard";
import { webGl as webglRender } from "./render/webgl";
import { canvas as canvasRender } from "./render/canvas";

export function useDosRuntime(canvas: HTMLCanvasElement | null, ci: CommandInterface | null) {
    if (canvas === null || ci === null) {
        return;
    }

    const renderBackend = useSelector((state: State) => state.dos.renderBackend);
    const renderAspect = useSelector((state: State) => state.dos.renderAspect);

    let aspect = undefined;
    switch (renderAspect) {
        case "1/1": aspect = 1; break;
        case "5/4": aspect = 5/4; break;
        case "4/3": aspect = 4/3; break;
        case "16/10": aspect = 16/10; break;
        case "16/9": aspect = 16/9; break;
        case "Fit": aspect = FitConstant;
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
