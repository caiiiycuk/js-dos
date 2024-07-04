import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";

export function _2d(layers: Layers, ci: CommandInterface, forceAspect?: number) {
    const canvas = layers.canvas;
    const context = canvas.getContext("2d");
    if (context === null) {
        throw new Error("Unable to create 2d context on given canvas");
    }

    let containerWidth = layers.width;
    let containerHeight = layers.height;
    let frameWidth = 0;
    let frameHeight = 0;

    const onResize = () => {
        const aspect = forceAspect ?? frameWidth / frameHeight;

        let width = containerWidth;
        let height = containerWidth / aspect;

        if (height > containerHeight) {
            height = containerHeight;
            width = containerHeight * aspect;
        }

        canvas.style.position = "relative";
        canvas.style.top = (containerHeight - height) / 2 + "px";
        canvas.style.left = (containerWidth - width) / 2 + "px";
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    };

    const onResizeLayer = (w: number, h: number) => {
        containerWidth = w;
        containerHeight = h;
        onResize();
    };
    layers.addOnResize(onResizeLayer);

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

    ci.events().onExit(() => {
        layers.removeOnResize(onResizeLayer);
    });
}
