import { CommandInterface } from "emulators";

class SamplesQueue {
    private samplesQueue: Float32Array[] = [];

    push(samples: Float32Array) {
        this.samplesQueue.push(samples);
    }

    length() {
        let total = 0;
        for (const next of this.samplesQueue) {
            total += next.length;
        }
        return total;
    }

    writeTo(dst: Float32Array, bufferSize: number) {
        let writeIt = 0;
        while (this.samplesQueue.length > 0) {
            const src = this.samplesQueue[0];
            const toRead = Math.min(bufferSize - writeIt, src.length);
            if (toRead === src.length) {
                dst.set(src, writeIt);
                this.samplesQueue.shift();
            } else {
                dst.set(src.slice(0, toRead), writeIt);
                this.samplesQueue[0] = src.slice(toRead);
            }

            writeIt += toRead;

            if (writeIt === bufferSize) {
                break;
            }
        }

        if (writeIt < bufferSize) {
            dst.fill(0, writeIt);
        }
    }
}

export function audioNode(ci: CommandInterface,
                          bindVolumeFn?: (fn: (volume: number) => void) => () => void) {
    const sampleRate = ci.soundFrequency();
    const channels = 1;

    if (sampleRate === 0) {
        console.warn("Can't create audio node with sampleRate === 0, ingnoring");
        return () => {};
    }

    let audioContext: AudioContext | null = null;

    if (typeof AudioContext !== "undefined") {
        audioContext = new AudioContext({
            sampleRate,
            latencyHint: "interactive",
        });
    } else if (typeof (window as any).webkitAudioContext !== "undefined") {
        // eslint-disable-next-line new-cap
        audioContext = new (window as any).webkitAudioContext({
            sampleRate,
            latencyHint: "interactive",
        });
    }

    if (audioContext == null) {
        return () => {};
    }

    const samplesQueue = new SamplesQueue();
    const bufferSize = 2048;
    const preBufferSize = 2048;

    ci.events().onSoundPush((samples) => {
        if (samplesQueue.length() < bufferSize * 2 + preBufferSize) {
            samplesQueue.push(samples);
        }
    });

    const audioNode = audioContext.createScriptProcessor(bufferSize, 0, channels);
    let started = false;

    const onQueueProcess = (event: AudioProcessingEvent) => {
        const numFrames = event.outputBuffer.length;
        const numChannels = event.outputBuffer.numberOfChannels;
        const samplesCount = samplesQueue.length();

        if (!started) {
            started = samplesCount >= preBufferSize;
        }

        if (!started) {
            return;
        }

        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = event.outputBuffer.getChannelData(channel);
            samplesQueue.writeTo(channelData, numFrames);
        }
    };

    audioNode.onaudioprocess = onQueueProcess;

    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    audioNode.connect(gainNode);

    gainNode.gain.value = 1.0;

    let unbindVolumeFn: () => void;
    if (bindVolumeFn) {
        unbindVolumeFn = bindVolumeFn((volume: number) => {
            gainNode.gain.value = volume;
        });
    }

    const resumeWebAudio = () => {
        if (audioContext !== null && audioContext.state === "suspended") {
            audioContext.resume();
        }
    };

    document.addEventListener("pointerdown", resumeWebAudio, { once: true });
    document.addEventListener("keydown", resumeWebAudio, { once: true });

    return () => {
        ci.events().onSoundPush(() => {});

        if (audioContext !== null) {
            audioNode.disconnect();
            gainNode.disconnect();
            audioContext
                .close()
                .catch(console.error);
            audioContext = null;
        }

        if (unbindVolumeFn !== undefined) {
            unbindVolumeFn();
        }

        document.removeEventListener("pointerdown", resumeWebAudio);
        document.removeEventListener("keydown", resumeWebAudio);
    };
}
