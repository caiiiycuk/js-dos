import { layers } from "./dom/layers";
import { resolveBundle } from "./network/xhr";
import { _2d } from "./graphics/_2d";
import { webGl } from "./graphics/webgl";
import { video } from "./graphics/video";
import { keyboard } from "./controls/keyboard";
import { mouse } from "./controls/mouse";
import { nipple } from "./controls/nipple";
import { button } from "./controls/button";
import { options } from "./controls/options";
import { domToKeyCode } from "./dom/keys";
import { audioNode } from "./sound/audio-node";
import { notyf } from "./notification/notyf";
import { save, load } from "./persist/save-load";
import { getGrid } from "./controls/grid";
import { DosFactoryType } from "./js-dos";
export declare class EmulatorsUi {
    dom: {
        layers: typeof layers;
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
        button: typeof button;
        options: typeof options;
    };
    notifications: {
        notyf: typeof notyf;
    };
    dos: DosFactoryType;
}
