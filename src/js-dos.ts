import { Emulators, CommandInterface } from "emulators";
import { EmulatorsUi } from "emulators-ui";

declare const emulators: Emulators;
declare const emulatorsUi: EmulatorsUi;

export async function Dos(root: HTMLDivElement,
                          bundleUrl: string): Promise<CommandInterface> {
    const layers = emulatorsUi.dom.layers(root);

    layers.showLoadingLayer();

    const bundle = await emulatorsUi.network.resolveBundle(bundleUrl);
    const ci = await emulators.dosWorker(bundle);

    emulatorsUi.graphics.webGl(layers, ci);
    emulatorsUi.sound.audioNode(ci);
    emulatorsUi.controls.keyboard(layers, ci);

    layers.hideLoadingLayer();

    return ci;
}

(window as any).Dos = Dos;
