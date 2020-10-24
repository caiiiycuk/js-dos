import { CommandInterface } from "../emulators";
export declare type JanusMessageType = "error" | "attached" | "started" | "onremotestream" | "destroyed";
export default function JanusBackend(restUrl: string, janus?: any): Promise<CommandInterface>;
