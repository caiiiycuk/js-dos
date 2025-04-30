import { useEffect, useRef } from "preact/hooks";

export function Slider(props: {
    class?: string,
    label?: string,
    value: number,
    vertical?: boolean,
    bgClass?: string,
    pointClass?: string,
    children?: any,
    onChange: (value: number) => void,
}) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const pointRef = useRef<HTMLDivElement>(null);
    const vertical = props.vertical ?? false;
    const bgClass = props.bgClass ?? "bg-base-200";
    useEffect(() => {
        if (sliderRef?.current === null) {
            return;
        }

        const sliderEl = sliderRef.current;

        let pressed = false;
        function updatePercent(e: PointerEvent) {
            const boundingRect = sliderEl.getBoundingClientRect();
            const percent = vertical ?
                1 - Math.min(1, Math.max(0,
                    (e.clientY - boundingRect.top) / boundingRect.height)) :
                Math.min(1, Math.max(0,
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
    }, [sliderRef, vertical]);

    const rounded = vertical ? "" : "rounded-full";
    const touchAlign = vertical ? "items-start" : "items-center";
    const percent = Math.min(Math.max(0, props.value * 100), 100);
    const flexClass = vertical ? "flex-col" : "flex-row";
    const containerSize = vertical ? "h-full" : "w-full";
    const touchSize = vertical ? "w-4" : "h-16";
    const bgSize = vertical ? "w-2" : "h-2";
    const cacluclatedStyle = vertical ? {
        active: {
            bottom: 0,
            height: "calc(" + percent + "%" + " + 12px)",
        },
        point: {
            left: "-8px",
            bottom: "calc(" + percent + "%" + " - 12px)",
        },
    } : {
        active: {
            left: 0,
            width: percent + "%",
        },
        point: {
            left: "calc(" + percent + "%" + " - 12px)",
        },
    };

    return <div class={props.class + " slider option " + containerSize}>
        {props.label && <div class={"label w-full flex justify-between gap-2 " + flexClass}>
            <p>{props.label}</p>
            <p>{props.value.toFixed(2)}</p>
        </div>}
        <div class={"touch " + touchSize + " " + containerSize + " " + flexClass + " " + touchAlign} ref={sliderRef}>
            <div class={"bg " + bgSize + " " + containerSize + " " + bgClass + " " + rounded}></div>
            <div class={"bg-active " + bgSize + " " + rounded}
                style={cacluclatedStyle.active}></div>
            <div class={"point " + props.pointClass} ref={pointRef}
                style={cacluclatedStyle.point}>
                {props.children}
            </div>
        </div>
    </div>;
}
