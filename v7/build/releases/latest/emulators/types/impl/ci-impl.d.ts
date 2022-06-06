import { CommandInterfaceEvents, MessageType, NetworkType } from "../emulators";
export declare class CommandInterfaceEventsImpl implements CommandInterfaceEvents {
    private onStdoutConsumers;
    private delayedStdout;
    private onFrameSizeConsumers;
    private onFrameConsumers;
    private onSoundPushConsumers;
    private onExitConsumers;
    private onMessageConsumers;
    private delayedMessages;
    private onNetworkConnectedConsumers;
    private onNetworkDisconnectedConsumers;
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (rgb: Uint8Array | null, rgba: Uint8Array | null) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
    onMessage: (consumer: (msgType: MessageType, ...args: any[]) => void) => void;
    onNetworkConnected(consumer: (networkType: NetworkType, address: string, port: number) => void): void;
    onNetworkDisconnected(consumer: (networkType: NetworkType) => void): void;
    fireStdout: (message: string) => void;
    fireFrameSize: (width: number, height: number) => void;
    fireFrame: (rgb: Uint8Array | null, rgba: Uint8Array | null) => void;
    fireSoundPush: (samples: Float32Array) => void;
    fireExit: () => void;
    fireMessage: (msgType: MessageType, ...args: any[]) => void;
    fireNetworkConnected: (networkType: NetworkType, address: string, port: number) => void;
    fireNetworkDisconnected: (networkType: NetworkType) => void;
}
