import { CommandInterface } from "emulators";
import { Layers } from "../dom/layers";

export type Mapper = {[keyCode: number]: number};

export function keyboard(layers: Layers,
                         ci: CommandInterface,
                         mapperOpt?: Mapper) {
    const mapper = mapperOpt || {};
    function map(keyCode: number) {
        if (mapper[keyCode] !== undefined) {
            return mapper[keyCode];
        }

        return keyCode;
    }

    layers.setOnKeyDown((keyCode: number) => {
        ci.sendKeyEvent(map(keyCode), true);
    });
    layers.setOnKeyUp((keyCode: number) => {
        ci.sendKeyEvent(map(keyCode), false);
    });
    layers.setOnKeyPress((keyCode: number) => {
        ci.simulateKeyPress(map(keyCode));
    });
    layers.setOnKeysPress((keyCodes: number[]) => {
        ci.simulateKeyPress(...keyCodes);
    });

    return () => {
        // eslint-disable-next-line
        layers.setOnKeyDown((keyCode: number) => { /**/ });
        // eslint-disable-next-line
        layers.setOnKeyUp((keyCode: number) => { /**/ });
        // eslint-disable-next-line
        layers.setOnKeyPress((keyCode: number) => { /**/ });
        // eslint-disable-next-line
        layers.setOnKeysPress((keyCodes: number[]) => { /**/ });
    };
}
