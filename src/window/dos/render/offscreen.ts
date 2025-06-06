import { CommandInterface } from "emulators";
import { resizeCanvas } from "./resize";

export function offscreenCanvas(canvas: HTMLCanvasElement,
                                ci: CommandInterface,
                                forceAspect?: number) {
    let frameWidth = 0;
    let frameHeight = 0;

    const onResize = () => {
        resizeCanvas(canvas, frameWidth, frameHeight, forceAspect);
    };

    const onResizeFrame = (w: number, h: number) => {
        frameWidth = w;
        frameHeight = h;
        onResize();
    };

    ci.events().onFrameSize(onResizeFrame);
    ci.events().onFrame(() => {
        console.error("onFrame should not be called");
    });

    onResizeFrame(ci.width(), ci.height());

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas.parentElement!);
    window.addEventListener("resize", onResize);

    return () => {
        ci.events().onFrameSize(() => {});
        ci.events().onFrame(() => {});
        resizeObserver.disconnect();
        window.removeEventListener("resize", onResize);
    };
}
