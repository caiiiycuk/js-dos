import { layers } from "./dom/layers";
import { lifecycle } from "./dom/lifecycle";
import { resolveBundle } from "./network/xhr";
import { _2d } from "./graphics/_2d";
import { webGl } from "./graphics/webgl";
import { video } from "./graphics/video";
import { keyboard } from "./controls/keyboard";
import { mouse } from "./controls/mouse/mouse-common";
import { nipple } from "./controls/nipple";
import { options } from "./controls/options";
import { domToKeyCode } from "./dom/keys";
import { audioNode } from "./sound/audio-node";
import { notyf } from "./notification/notyf";
import { save, load } from "./persist/save-load";
import { getGrid } from "./controls/grid";
import { LStorage } from "./dom/storage";
import { DosFactoryType } from "./js-dos";
export declare class EmulatorsUi {
    build: {
        short: string;
        version: string;
        buildSeed: number;
    };
    dom: {
        layers: typeof layers;
        lifecycle: typeof lifecycle;
        pointers: {
            bind: {
                mobile: boolean;
                canLock: boolean;
                starters: string[];
                changers: string[];
                enders: string[];
                prevents: string[];
                leavers: string[];
            };
            getPointerState: typeof import("./dom/pointer").getPointerState;
        };
        storage: LStorage;
    };
    network: {
        resolveBundle: typeof resolveBundle;
    };
    graphics: {
        webGl: typeof webGl;
        _2d: typeof _2d;
        video: typeof video;
    };
    sound: {
        audioNode: typeof audioNode;
    };
    persist: {
        save: typeof save;
        load: typeof load;
    };
    controls: {
        getGrid: typeof getGrid;
        namedKeyCodes: {
            [name: string]: number;
        };
        domToKeyCodes: {
            [index: number]: number;
        };
        domToKeyCode: typeof domToKeyCode;
        keyCodesToDom: {
            [index: number]: number;
        };
        keyboard: typeof keyboard;
        mouse: typeof mouse;
        nipple: typeof nipple;
        options: typeof options;
    };
    notifications: {
        notyf: typeof notyf;
    };
    dos: DosFactoryType;
}
