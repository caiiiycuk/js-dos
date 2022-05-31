import { useEffect, useRef, useState } from "preact/hooks";
import { Props } from "../player-app";
import { html } from "../dom";
import { Icons } from "../icons";

const minScale = 0.8;
const maxScale = 1.8;
const scaleRange = maxScale - minScale;

interface ControlsProps extends Props {
    class?: string,
};

export function ScaleControl(props: ControlsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(props.player().scaleControls);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (scrollRef === null || scrollRef.current === null) {
            return;
        }

        let started = false;
        const el = scrollRef.current;
        const calcScale = (ev: PointerEvent) => {
            const rawPercent = 1 - (ev.clientY - el.offsetTop) / el.clientHeight;
            const precent = Math.max(Math.min(1, rawPercent), 0);
            return precent * scaleRange;
        };
        const onStart = (ev: PointerEvent) => {
            if (ev.target !== el || started) {
                return;
            }
            started = true;
            setOpacity(80);

            setScale(calcScale(ev));
            ev.stopPropagation();
            ev.preventDefault();
        };
        const onMove = (ev: PointerEvent) => {
            if (!started) {
                return;
            }

            const scale = calcScale(ev);
            setScale(scale);
            props.player().setScaleControls(minScale + scale);
            ev.stopPropagation();
            ev.preventDefault();
        };
        const onEnd = (ev: PointerEvent) => {
            if (!started) {
                return;
            }

            started = false;
            setOpacity(0);
            const scale = calcScale(ev);
            setScale(scale);
            props.player().setScaleControls(minScale + scale);
            ev.stopPropagation();
            ev.preventDefault();
        };

        window.addEventListener("pointerdown", onStart);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("pointercancel", onEnd);

        return () => {
            window.removeEventListener("pointerdown", onStart);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
        };
    }, [scrollRef, props.mobileControls, props.mirroredControls]);

    if (!props.mobileControls && !props.mirroredControls) {
        return null;
    }

    const top = (100 - Math.max(0, Math.min(100, Math.round(scale / scaleRange * 100)))) + "%";

    return html`
        <div class="h-full flex flex-col py-0 items-center">
            <div class="bg-gray-200 rounded flex items-center justify-center h-6 w-5 mt-4 text-gray-600">
                <${props.mirroredControls ? Icons.SwithcHorizontal : Icons.Mobile} class="h-4 w-4" />
            </div>
            <div class="flex-grow py-4">
                <div ref=${scrollRef} class=${"relative sensitivity cursor-pointer rounded-2xl bg-gray-400 w-2 " +
                    "h-full" + (props.class ? props.class : "")}>
                    <div class="flex flex-row items-center absolute pointer-events-none -mt-3" style=${{ top }}>
                        <div class="bg-gray-600 -ml-2 flex-shrink-0 w-6 h-6 rounded-full"></div>
                        <div class="bg-green-100 ml-2 py-1 px-2 rounded z-50 ${"opacity-" + opacity}">
                            ${Math.round((minScale + scale) * 10) / 10}
                        </div>
                    </div>    
                </div>
            </div>
        </div>
    `;
}
