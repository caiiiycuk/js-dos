
import { Build } from "./build";
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
import { domToKeyCode, domToKeyCodes, keyCodesToDom, namedKeyCodes } from "./dom/keys";
import { audioNode } from "./sound/audio-node";
import { notyf } from "./notification/notyf";
import { save, load } from "./persist/save-load";
import { getGrid } from "./controls/grid";
import { pointers } from "./dom/pointer";
import { LStorage } from "./dom/storage";

import { DosInstance, DosFactoryType, DosOptions } from "./js-dos";

export class EmulatorsUi {
    build = Build;

    dom = {
        layers, // DOM components that used by js-dos player
        lifecycle, // compnent that manges liefcycle events
        pointers, // abstraction over mouse, touch, pointer API
        storage: new LStorage(undefined, "emulators.ui."), // localStorage abstaction
    };

    network = {
        resolveBundle, // GET request to download bundles
    };

    graphics = {
        webGl, // default webgl renderer
        _2d, // fallback renderer
        video, // default janus renderer
    };

    sound = {
        audioNode, // default auidio processor
    };

    persist = {
        save, // store updated bundle into 'persist.db'
        load, // get updated bundle form `persist.db`
    };

    controls = {
        getGrid, // returns grid processor by grid type
        namedKeyCodes, // mapping from key name to it's key code
        domToKeyCodes, // mapping from DOM key codes to js-dos key codes
        domToKeyCode, // function that converts DOM key code to js-dos key code
        keyCodesToDom, // mapping from js-dos key codes to DOM key codes
        keyboard, // default keyboard processor
        mouse, // default mouse processor
        nipple, // multitouch control for emulating keyboard on mobiles
        options, // default options control (fullscreen, save, etc.)
    };

    notifications = {
        notyf, // default notifications system
    };

    // default player
    dos: DosFactoryType = (root: HTMLDivElement, options?: DosOptions) => {
        return new DosInstance(root, impl, options || {});
    };
}

const impl = new EmulatorsUi();
(window as any).emulatorsUi = impl;
(window as any).Dos = impl.dos;
