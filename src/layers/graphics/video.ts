import { Layers } from "../dom/layers";
import { CommandInterface } from "emulators";
import { JanusMessageType } from "emulators/dist/types/janus/janus-impl";

export function video(layers: Layers, ci: CommandInterface) {
    layers.switchToVideo();

    ci.events().onMessage((msgType: JanusMessageType | string, stream: MediaStream) => {
        if (msgType === "onremotestream") {
            (window as any).Janus.attachMediaStream(layers.video, stream);
        }
    });
}
