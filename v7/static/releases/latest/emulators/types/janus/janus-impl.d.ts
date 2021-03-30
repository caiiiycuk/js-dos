import { CommandInterface } from "../emulators";
export declare type JanusMessageType = "error" | "attached" | "started" | "onremotestream" | "destroyed";
export interface JanusCommandInterface extends CommandInterface {
    logVisual: (video: HTMLVideoElement) => void;
}
export default function JanusBackend(restUrl: string, janus?: any): Promise<CommandInterface>;
