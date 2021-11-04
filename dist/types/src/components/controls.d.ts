import { Props } from "../player-app";
interface ControlsProps extends Props {
    class?: string;
    column?: boolean;
    portal: boolean;
}
export declare function Controls(props: ControlsProps): import("preact").VNode<any> | import("preact").VNode<any>[];
export {};
