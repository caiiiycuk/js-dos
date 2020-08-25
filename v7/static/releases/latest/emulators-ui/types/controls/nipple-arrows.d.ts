import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare type Event = "dir:up" | "dir:down" | "dir:left" | "dir:right" | "plain:up" | "plain:down" | "plain:left" | "plain:right" | "end:release" | "tap";
export interface EventMapping {
    joystickId: 0 | 1;
    event: Event;
    mapTo: number;
}
export declare const defaultMapping: EventMapping[];
export declare function nippleArrows(layers: Layers, ci: CommandInterface, optionalMapping?: EventMapping[]): void;
