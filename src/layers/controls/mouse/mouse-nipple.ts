import nipplejs from "nipplejs";
import { CommandInterface } from "emulators";
import { Layers } from "../../dom/layers";
import { pointer } from "../../../window/dos/controls/mouse/pointer";

export function mouseNipple(sensitivity: number, layers: Layers, ci: CommandInterface) {
    const el = layers.mouseOverlay;
    const options = {
        capture: true,
    };

    let startedAt = -1;
    const onStart = () => {
        startedAt = Date.now();
    };

    const onEnd = () => {
        const delay = Date.now() - startedAt;
        if (delay < 500) {
            const button = layers.pointerButton || 0;
            ci.sendMouseButton(button, true);
            setTimeout(() => ci.sendMouseButton(button, false), 16);
        }
    };

    for (const next of pointer.starters) {
        el.addEventListener(next, onStart, options);
    }
    for (const next of pointer.enders) {
        el.addEventListener(next, onEnd, options);
    }

    const nipple = nipplejs.create({
        zone: el,
        multitouch: false,
        maxNumberOfNipples: 1,
        mode: "dynamic",
    });

    let dx = 0;
    let dy = 0;

    const intervalId = setInterval(() => {
        (ci as any).sendMouseRelativeMotion(dx, dy);
    }, 16);

    nipple.on("start", () => {
        startedAt = Date.now();
        dx = 0;
        dy = 0;
    });

    nipple.on("move", function(evt: any, data: any) {
        const { x, y } = data.vector;

        dx = x * data.distance * sensitivity;
        dy = -y * data.distance * sensitivity;
    });

    nipple.on("end", () => {
        dx = 0;
        dy = 0;
    });

    return () => {
        for (const next of pointer.starters) {
            el.removeEventListener(next, onStart, options);
        }
        for (const next of pointer.enders) {
            el.removeEventListener(next, onEnd, options);
        }
        clearInterval(intervalId);
        nipple.destroy();
    };
}
