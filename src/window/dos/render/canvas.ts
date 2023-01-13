import { CommandInterface } from "emulators";
import { resizeCanvas } from "./resize";

export function canvas(canvas: HTMLCanvasElement,
                       ci: CommandInterface,
                       forceAspect?: number) {
    const context = canvas.getContext("2d");
    if (context === null) {
        throw new Error("Unable to create 2d context on given canvas");
    }

    let frameWidth = 0;
    let frameHeight = 0;

    const onResize = () => {
        resizeCanvas(canvas, frameWidth, frameHeight, forceAspect);
    };

    let rgba = new Uint8ClampedArray(0);
    const onResizeFrame = (w: number, h: number) => {
        frameWidth = w;
        frameHeight = h;
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        rgba = new Uint8ClampedArray(w * h * 4);
        onResize();
    };
    ci.events().onFrameSize(onResizeFrame);
    ci.events().onFrame((frameRgb, frameRgba) => {
        if (frameRgb === null && frameRgba === null) {
            return;
        }

        const frame = (frameRgb !== null ? frameRgb : frameRgba) as Uint8Array;

        let frameOffset = 0;
        let rgbaOffset = 0;

        while (rgbaOffset < rgba.length) {
            rgba[rgbaOffset++] = frame[frameOffset++];
            rgba[rgbaOffset++] = frame[frameOffset++];
            rgba[rgbaOffset++] = frame[frameOffset++];
            rgba[rgbaOffset++] = 255;

            if (frame.length === rgba.length) {
                frameOffset++;
            }
        }

        context.putImageData(new ImageData(rgba, frameWidth, frameHeight), 0, 0);
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
