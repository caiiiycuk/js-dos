import { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { html } from "../dom";

export interface HorizontalSliderProps {
    class?: string,
    minValue: number,
    maxValue: number,
    maxLabel?: string,
    initialValue: number,
    onChange: (value: number) => void,
    icon: JSX.Element,
    registerListner: (fn: (value: number) => void) => void,
    removeListener: (fn: (value: number) => void) => void,
};

export function HorizontalSlider(props: HorizontalSliderProps) {
    const { minValue, maxValue, initialValue, onChange, icon } = props;
    const valueRange = maxValue - minValue;
    const sliderRef = useRef<HTMLDivElement>(null);
    const [value, setValue] = useState(initialValue);
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (sliderRef === null || sliderRef.current === null) {
            return;
        }

        let started = false;
        const el = sliderRef.current;
        const calcValue = (ev: PointerEvent) => {
            const boundingRect = el.getBoundingClientRect();
            const rawPercent = (ev.clientX - boundingRect.left) / boundingRect.width;
            const precent = Math.max(Math.min(1, rawPercent), 0);
            return precent * valueRange;
        };
        const onStart = (ev: PointerEvent) => {
            if (ev.target !== el || started) {
                return;
            }
            started = true;
            setOpacity(80);

            setValue(calcValue(ev));
            ev.stopPropagation();
            ev.preventDefault();
        };
        const onMove = (ev: PointerEvent) => {
            if (!started) {
                return;
            }

            const newValue = calcValue(ev);
            setValue(newValue);
            onChange(newValue);
            ev.stopPropagation();
            ev.preventDefault();
        };
        const onEnd = (ev: PointerEvent) => {
            if (!started) {
                return;
            }

            started = false;
            setOpacity(0);
            const newValue = calcValue(ev);
            setValue(newValue);
            onChange(newValue);
            ev.stopPropagation();
            ev.preventDefault();
        };

        window.addEventListener("pointerdown", onStart);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onEnd);
        window.addEventListener("pointercancel", onEnd);
        el.addEventListener("pointerup", onEnd);
        el.addEventListener("pointercancel", onEnd);
        props.registerListner(setValue);

        return () => {
            props.removeListener(setValue);
            window.removeEventListener("pointerdown", onStart);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onEnd);
            window.removeEventListener("pointercancel", onEnd);
            el.removeEventListener("pointerup", onEnd);
            el.removeEventListener("pointercancel", onEnd);
        };
    }, [sliderRef]);

    const left = (Math.max(0, Math.min(100, Math.round(value / valueRange * 100)))) + "%";

    let label = Math.round((minValue + value) * 10) / 10 + "";
    if (minValue + value === maxValue && props.maxLabel !== undefined) {
        label = props.maxLabel;
    }

    return html`
        <div class="h-full flex flex-row py-0 items-center">
            <div class="bg-gray-200 rounded flex items-center justify-center h-6 w-5 lt-4 text-gray-600">
                <${icon} class="h-4 w-4" />
            </div>
            <div class="cursor-pointer flex-grow px-4 py-2" ref=${sliderRef}>
                <div class=${"pointer-events-none relative sensitivity rounded-2xl bg-gray-400 h-2 " +
                    "w-full" + (props.class ? props.class : "")}>
                    <div class="flex flex-row items-center absolute -mt-3" style=${{ left }}>
                        <div class="bg-gray-600 -ml-2 flex-shrink-0 w-6 h-6 rounded-full"></div>
                        <div class="bg-green-100 ml-2 py-1 px-2 rounded z-50 ${"opacity-" + opacity}">
                            ${label}
                        </div>
                    </div>    
                </div>
            </div>
        </div>
    `;
}
