// eslint-disable-next-line
const nipplejs = require("nipplejs");

import { KBD_NONE } from "../dom/keys";

import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";

export type Event =
    "dir:up" | "dir:down" | "dir:left" | "dir:right" |
    "plain:up" | "plain:down" | "plain:left" | "plain:right" |
    "end:release" | "tap";

export interface EventMapping {
    joystickId: 0 | 1,
    event: Event,
    mapTo: number,
}

export function nipple(layers: Layers,
                       ci: CommandInterface,
                       mapping: EventMapping[]) {
    const manager = nipplejs.create({
        zone: layers.mouseOverlay,
        multitouch: true,
        maxNumberOfNipples: 2,
    });

    let pressed = -1;

    const press = (keyCode: number) => {
        layers.fireKeyDown(keyCode);
        pressed = keyCode;
    };

    const release = () => {
        if (pressed !== -1) {
            layers.fireKeyUp(pressed);
            pressed = -1;
        }
    };

    const releaseOnEnd: {[index: number]: boolean} = {};
    const tapJoysticks: {[index: number]: number} = {};
    const usedTimes: {[index: number]: number} = {
    };
    for (const next of mapping) {
        if (next.event === "end:release") {
            releaseOnEnd[next.joystickId] = true;
        } else if (next.mapTo !== KBD_NONE) {
            if (next.event === "tap") {
                tapJoysticks[next.joystickId] = next.mapTo;
            } else {
                manager.on(next.event, () => {
                    usedTimes[next.joystickId] = Date.now();
                    release();
                    press(next.mapTo);
                });
            }
        }
    }

    const startTimes: {[index: number]: number} = {};
    manager.on("start", () => {
        const id = manager.ids.length - 1;
        startTimes[id] = Date.now();
    });

    manager.on("end", () => {
        const id = manager.ids.length - 1;
        const delay = Date.now() - startTimes[id];

        if (releaseOnEnd[id] === true) {
            release();
        }

        if (tapJoysticks[id] && delay < 500 && usedTimes[id] < startTimes[id]) {
            layers.fireKeyPress(tapJoysticks[id]);
        }
    });

    return () => manager.destroy();
}

