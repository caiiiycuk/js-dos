import { DosConfig } from "../dos/bundle/dos-conf";
import { CommandInterface } from "../emulators";
import { CommandInterfaceEventsImpl } from "../impl/ci-impl";
export declare type ClientMessage = "wc-install" | "wc-run" | "wc-pack-fs-to-bundle" | "wc-add-key" | "wc-mouse-move" | "wc-mouse-button" | "wc-exit" | "wc-sync-sleep";
export declare type ServerMessage = "ws-ready" | "ws-server-ready" | "ws-frame-set-size" | "ws-update-lines" | "ws-log" | "ws-warn" | "ws-err" | "ws-stdout" | "ws-exit" | "ws-persist" | "ws-sound-init" | "ws-sound-push" | "ws-config" | "ws-sync-sleep";
export declare type MessageHandler = (name: ServerMessage, props: {
    [key: string]: any;
}) => void;
export interface TransportLayer {
    sessionId: string;
    sendMessageToServer(name: ClientMessage, props?: {
        [key: string]: any;
    }): void;
    initMessageHandler(handler: MessageHandler): void;
    exit?: () => void;
}
export interface FrameLine {
    start: number;
    heapu8: Uint8Array;
}
export declare class CommandInterfaceOverTransportLayer implements CommandInterface {
    private startedAt;
    private frameWidth;
    private frameHeight;
    private rgb;
    private freq;
    private bundles?;
    private transport;
    private ready;
    private persistPromise?;
    private persistResolve?;
    private exitPromise?;
    private exitResolve?;
    private eventsImpl;
    private keyMatrix;
    private configPromise;
    private configResolve;
    private startupErrorLog;
    constructor(bundles: Uint8Array[], transport: TransportLayer, ready: (err: Error | null) => void);
    private sendClientMessage;
    private onServerMessage;
    private onConfig;
    private onFrameSize;
    private onFrameLines;
    private onSoundInit;
    private onSoundPush;
    private onLog;
    private onWarn;
    private onErr;
    private onStdout;
    config(): Promise<DosConfig>;
    width(): number;
    height(): number;
    soundFrequency(): number;
    screenshot(): Promise<ImageData>;
    simulateKeyPress(...keyCodes: number[]): void;
    sendKeyEvent(keyCode: number, pressed: boolean): void;
    addKey(keyCode: number, pressed: boolean, timeMs: number): void;
    sendMouseMotion(x: number, y: number): void;
    sendMouseButton(button: number, pressed: boolean): void;
    persist(): Promise<Uint8Array>;
    private onPersist;
    exit(): Promise<void>;
    private onExit;
    events(): CommandInterfaceEventsImpl;
}
