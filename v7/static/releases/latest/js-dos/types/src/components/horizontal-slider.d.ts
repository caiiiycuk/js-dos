import { JSX } from "preact";
export interface HorizontalSliderProps {
    class?: string;
    minValue: number;
    maxValue: number;
    maxLabel?: string;
    initialValue: number;
    onChange: (value: number) => void;
    icon: JSX.Element;
    registerListner: (fn: (value: number) => void) => void;
    removeListener: (fn: (value: number) => void) => void;
}
export declare function HorizontalSlider(props: HorizontalSliderProps): import("preact").VNode<any> | import("preact").VNode<any>[];
