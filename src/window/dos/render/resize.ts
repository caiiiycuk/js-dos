import { FitConstant } from "../../../store/dos";

export function resizeCanvas(canvas: HTMLCanvasElement,
                             frameWidth: number,
                             frameHeight: number,
                             forceAspect?: number) {
    const rect = canvas.parentElement!.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;

    if (frameHeight === 0) {
        return;
    }
    const aspect =
        forceAspect === FitConstant ? (containerWidth / containerHeight) :
            (forceAspect ?? (frameWidth / frameHeight));

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
