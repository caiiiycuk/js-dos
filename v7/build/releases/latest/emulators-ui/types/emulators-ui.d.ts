import { layers } from "./dom/layers";
import { resolveBundle } from "./network/xhr";
import { webGl } from "./graphics/webgl";
import { keyboard } from "./controls/keyboard";
import { nippleArrows } from "./controls/nipple-arrows";
import { domToKeyCode } from "./dom/keys";
import { audioNode } from "./sound/audio-node";
import { save, load } from "./persist/save-load";
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
    };
    sound: {
        audioNode: typeof audioNode;
    };
    persist: {
        save: typeof save;
        load: typeof load;
    };
    controls: {
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
        nippleArrows: typeof nippleArrows;
    };
    dos: DosFactoryType;
}
