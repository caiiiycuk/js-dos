import { CommandInterfaceEvents } from "../emulators";
export declare class CommandInterfaceEventsImpl implements CommandInterfaceEvents {
    private onStdoutConsumers;
    private onFrameSizeConsumers;
    private onFrameConsumers;
    private onSoundPushConsumers;
    private onExitConsumers;
    onStdout: (consumer: (message: string) => void) => void;
    onFrameSize: (consumer: (width: number, height: number) => void) => void;
    onFrame: (consumer: (frame: Uint8Array) => void) => void;
    onSoundPush: (consumer: (samples: Float32Array) => void) => void;
    onExit: (consumer: () => void) => void;
    fireStdout: (message: string) => void;
    fireFrameSize: (width: number, height: number) => void;
    fireFrame: (frame: Uint8Array) => void;
    fireSoundPush: (samples: Float32Array) => void;
    fireExit: () => void;
}
