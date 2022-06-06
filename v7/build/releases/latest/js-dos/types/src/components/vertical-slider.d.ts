import { JSX } from "preact";
export interface VerticalSliderProps {
    class?: string;
    minValue: number;
    maxValue: number;
    initialValue: number;
    onChange: (value: number) => void;
    icon: JSX.Element;
    registerListner: (fn: (value: number) => void) => void;
    removeListener: (fn: (value: number) => void) => void;
}
export declare function VerticalSlider(props: VerticalSliderProps): import("preact").VNode<any> | import("preact").VNode<any>[];
