import { CommandInterface, MessageType } from "emulators";
import { Layers } from "../dom/layers";

export function notyf(layers: Layers, ci: CommandInterface) {
    const notyf = layers.notyf;
    ci.events().onMessage((msgType: MessageType, ...args) => {
        if (msgType === "error") {
            notyf.error({
                message: JSON.stringify(args),
            });
        }
    });
}
