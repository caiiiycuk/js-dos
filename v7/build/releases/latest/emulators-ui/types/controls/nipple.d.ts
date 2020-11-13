import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";
export declare type Event = "dir:up" | "dir:down" | "dir:left" | "dir:right" | "plain:up" | "plain:down" | "plain:left" | "plain:right" | "end:release" | "tap";
export interface EventMapping {
    joystickId: 0 | 1;
    event: Event;
    mapTo: number;
}
export declare function nipple(layers: Layers, ci: CommandInterface, mapping: EventMapping[]): () => any;
