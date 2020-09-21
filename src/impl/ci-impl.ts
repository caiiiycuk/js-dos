import { CommandInterfaceEvents, MessageType } from "../emulators";

export class CommandInterfaceEventsImpl implements CommandInterfaceEvents {

    private onStdoutConsumers: ((message: string) => void)[] = [];
    private onFrameSizeConsumers: ((width: number, height: number) => void)[] = [];
    private onFrameConsumers: ((frame: Uint8Array) => void)[] = [];
    private onSoundPushConsumers: ((samples: Float32Array) => void)[] = [];
    private onExitConsumers: (() => void)[] = [];

    private onMessageConsumers: ((msgType: MessageType, ...args: any[]) => void)[] = [];

    onStdout = (consumer: (message: string) => void) => {
        this.onStdoutConsumers.push(consumer);
    }

    onFrameSize = (consumer: (width: number, height: number) => void) => {
        this.onFrameSizeConsumers.push(consumer);
    }

    onFrame = (consumer: (frame: Uint8Array) => void) => {
        this.onFrameConsumers.push(consumer);
    }

    onSoundPush = (consumer: (samples: Float32Array) => void) => {
        this.onSoundPushConsumers.push(consumer);
    }

    onExit = (consumer: () => void) => {
        this.onExitConsumers.push(consumer);
    }

    onMessage = (consumer: (msgType: MessageType, ...args: any[]) => void) => {
        this.onMessageConsumers.push(consumer);
    }

    fireStdout = (message: string) => {
        for (const next of this.onStdoutConsumers) {
            next(message);
        }
    }

    fireFrameSize = (width: number, height: number) => {
        for (const next of this.onFrameSizeConsumers) {
            next(width, height);
        }
    }

    fireFrame = (frame: Uint8Array) => {
        for (const next of this.onFrameConsumers) {
           next(frame);
        }
    }

    fireSoundPush = (samples: Float32Array) => {
        for (const next of this.onSoundPushConsumers) {
            next(samples);
        }
    }

    fireExit = () => {
        for (const next of this.onExitConsumers) {
            next();
        }

        this.onStdoutConsumers = [];
        this.onFrameSizeConsumers = [];
        this.onFrameConsumers = [];
        this.onSoundPushConsumers = [];
        this.onExitConsumers = [];
        this.onMessageConsumers = [];
    }

    fireMessage = (msgType: MessageType, ...args: any[]) => {
        for (const next of this.onMessageConsumers) {
            next(msgType, ...args);
        }
    }

}
