import { layers } from "./dom/layers";
import { resolveBundle } from "./network/xhr";
import { webGl } from "./graphics/webgl";
import { keyboard } from "./controls/keyboard";
import { nippleArrows } from "./controls/nipple-arrows";
import { audioNode } from "./sound/audio-node";
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
    controls: {
        keyboard: typeof keyboard;
        nippleArrows: typeof nippleArrows;
    };
}
