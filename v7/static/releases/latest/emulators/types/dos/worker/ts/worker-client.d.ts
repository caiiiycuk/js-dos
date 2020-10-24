import { WasmModule } from "../../../impl/modules";
import { DosConfig } from "../../bundle/dos-conf";
declare type ClientMessage = "wc-install" | "wc-run" | "wc-pack-fs-to-bundle" | "wc-add-key" | "wc-exit";
declare type ServerMessage = "ws-ready" | "ws-server-ready" | "ws-frame-set-size" | "ws-update-lines" | "ws-log" | "ws-warn" | "ws-err" | "ws-stdout" | "ws-exit" | "ws-persist" | "ws-sound-init" | "ws-sound-push" | "ws-config";
export interface FrameLine {
    start: number;
    heapu8: Uint8Array;
}
export interface WorkerHost {
    onConfig: (config: DosConfig) => void;
    onFrameSize: (width: number, height: number) => void;
    onFrameLines: (lines: FrameLine[]) => void;
    onPersist: (bundle: Uint8Array) => void;
    onStdout: (message: string) => void;
    onSoundInit: (freq: number) => void;
    onSoundPush: (samples: Float32Array) => void;
    onExit: () => void;
    onLog: (...args: any[]) => void;
    onWarn: (...args: any[]) => void;
    onErr: (...args: any[]) => void;
}
export declare class WorkerClient {
    private worker;
    private bundle?;
    private host;
    private ready;
    private keyMatrix;
    constructor(workerUrl: string, wasmModule: WasmModule, bundle: Uint8Array, host: WorkerHost, ready: () => void);
    sendMessage(name: ClientMessage, props?: {
        [key: string]: any;
    }): void;
    onMessage(name: ServerMessage, props: {
        [key: string]: any;
    }): void;
    addKey(keyCode: number, pressed: boolean): void;
    persist(): void;
    exit(): void;
}
export {};
