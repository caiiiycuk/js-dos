import { layers } from "./dom/layers";
import { resolveBundle } from "./network/xhr";
import { webGl } from "./graphics/webgl";
import { keyboard } from "./controls/keyboard";
import { audioNode } from "./sound/audio-node";
export declare const EmulatorsUi: {
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
    };
};
