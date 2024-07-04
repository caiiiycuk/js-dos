import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import { keyboard } from "./keyboard";
import { mouse } from "./mouse/mouse-common";
import { options } from "./options";
import { DosInstance } from "../js-dos";

export function initNullLayersControl(
    dosInstance: DosInstance,
    layers: Layers,
    ci: CommandInterface) {
    const unbindKeyboard = keyboard(layers, ci);
    const unbindMouse = mouse(dosInstance.autolock, dosInstance.sensitivity, layers, ci);
    const unbindOptions =
        (layers.options.optionControls?.length === 0) ?
            () => {/**/} :
            options(layers, ["default"], () => {/**/}, 54, 54 / 4, 0);

    return () => {
        unbindKeyboard();
        unbindMouse();
        unbindOptions();
    };
}
