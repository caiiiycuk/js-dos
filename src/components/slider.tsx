import { useEffect, useRef } from "preact/hooks";

export function Slider(props: {
    class?: string,
    label: string,
    value: number,
    onChange: (value: number) => void,
}) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const pointRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sliderRef?.current === null) {
            return;
        }

        const sliderEl = sliderRef.current;

        let pressed = false;
        function updatePercent(e: PointerEvent) {
            const boundingRect = sliderEl.getBoundingClientRect();
            const percent = Math.min(1, Math.max(0,
                (e.clientX - boundingRect.left) / boundingRect.width));
            props.onChange(percent);
        }

        function onPointerDown(e: PointerEvent) {
            pressed = true;
            updatePercent(e);
        }
        function onPointerMove(e: PointerEvent) {
            if (!pressed) {
                return;
            }

            updatePercent(e);
        }

        function onPointerUp(e: PointerEvent) {
            pressed = false;
        }


        sliderEl.addEventListener("pointerdown", onPointerDown);
        sliderEl.addEventListener("pointermove", onPointerMove);
        sliderEl.addEventListener("pointerup", onPointerUp);
        sliderEl.addEventListener("pointercancel", onPointerUp);
        sliderEl.addEventListener("pointerleave", onPointerUp);

        return () => {
            sliderEl.removeEventListener("pointerdown", onPointerDown);
            sliderEl.removeEventListener("pointermove", onPointerMove);
            sliderEl.removeEventListener("pointerup", onPointerUp);
            sliderEl.removeEventListener("pointercancel", onPointerUp);
            sliderEl.removeEventListener("pointerleave", onPointerUp);
        };
    }, [sliderRef]);

    const percent = Math.min(Math.max(0, props.value * 100), 100);

    return <div class={props.class + " slider option"}>
        <div class="label">{props.label}</div>
        <div class="touch" ref={sliderRef}>
            <div class="bg"></div>
            <div class="point" ref={pointRef}
                style={{ left: "calc(" + percent + "%" + " - 12px)" }}></div>
        </div>
    </div>;
}
