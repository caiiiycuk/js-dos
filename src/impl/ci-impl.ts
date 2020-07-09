import { CommandInterfaceEvents } from "../emulators";

export class CommandInterfaceEventsImpl implements CommandInterfaceEvents {

    private onStdoutConsumer: ((message: string) => void) | null = null;
    private onFrameSizeConsumer: ((width: number, height: number) => void) | null = null;
    private onFrameConsumer: ((frame: Uint8ClampedArray) => void) | null = null;
    private onSoundPushConsumer: ((samples: Float32Array) => void) | null = null;

    onStdout(consumer: ((message: string) => void) | null) {
        this.onStdoutConsumer = consumer;
    }

    onFrameSize(consumer: ((width: number, height: number) => void) | null) {
        this.onFrameSizeConsumer = consumer;
    }

    onFrame(consumer: ((frame: Uint8ClampedArray) => void) | null) {
        this.onFrameConsumer = consumer;
    }

    onSoundPush(consumer: ((samples: Float32Array) => void) | null) {
        this.onSoundPushConsumer = consumer;
    }

    fireStdout(message: string) {
        if (this.onStdoutConsumer !== null) {
            this.onStdoutConsumer(message);
        }
    }

    fireFrameSize(width: number, height: number) {
        if (this.onFrameSizeConsumer !== null) {
            this.onFrameSizeConsumer(width, height);
        }
    }

    fireFrame(frame: Uint8ClampedArray) {
        if (this.onFrameConsumer !== null) {
            this.onFrameConsumer(frame);
        }
    }

    fireSoundPush(samples: Float32Array) {
        if (this.onSoundPushConsumer !== null) {
            this.onSoundPushConsumer(samples);
        }
    }
}
