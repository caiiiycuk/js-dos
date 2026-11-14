import type { EmscriptenModuleInstance, Mt32ModuleFactory, Mt32EngineOptions } from "./types.js";

export class Mt32Engine {
    private module: EmscriptenModuleInstance | null = null;
    private leftPtr: number = 0;
    private rightPtr: number = 0;
    private isInitialized: boolean = false;

    /**
     * Initializes the WASM module and loads Roland MT-32 ROMs.
        * @param {Mt32ModuleFactory} factory Factory used to create the WASM module.
        * @param {ArrayBuffer} controlRom The MT-32 control ROM data.
        * @param {ArrayBuffer}pcmRom The MT-32 PCM ROM data.
        * @param {Mt32EngineOptions} options Optional engine configuration.
     */
    public async init(
        factory: Mt32ModuleFactory,
        controlRom: ArrayBuffer,
        pcmRom: ArrayBuffer,
        options: Mt32EngineOptions = {},
    ): Promise<boolean> {
        const sampleRate = options.sampleRate ?? 44100;

        this.module = await factory({
            locateFile: (path: string) => options.wasmBinaryPath ?? path,
        });

        const initResult = this.module._mt32_init(sampleRate);
        if (initResult === 0) {
            throw new Error("Failed to create MT-32 context");
        }

        const ctrlBytes = new Uint8Array(controlRom);
        const pcmBytes = new Uint8Array(pcmRom);

        const ctrlPtr = this.module._malloc(ctrlBytes.length);
        const pcmPtr = this.module._malloc(pcmBytes.length);

        this.module.HEAPU8.set(ctrlBytes, ctrlPtr);
        this.module.HEAPU8.set(pcmBytes, pcmPtr);

        const loadResult = this.module._mt32_load_roms(
            ctrlPtr,
            ctrlBytes.length,
            pcmPtr,
            pcmBytes.length,
        );

        this.module._free(ctrlPtr);
        this.module._free(pcmPtr);

        if (loadResult === 0) {
            throw new Error("Failed to open MT-32 synthesizer with provided ROMs");
        }

        // Pre-allocate stereo buffers (up to 16384 frames)
        this.leftPtr = this.module._malloc(16384 * 4);
        this.rightPtr = this.module._malloc(16384 * 4);

        this.isInitialized = true;
        return true;
    }

    /**
     * Sends a packed 3-byte MIDI message.
        * @param {number} status The MIDI status byte.
        * @param {number} data1 The first MIDI data byte.
        * @param {number} data2 The second MIDI data byte.
     */
    public sendMidiShort(status: number, data1: number, data2: number): void {
        if (!this.module || !this.isInitialized) return;
        const packed = status | (data1 << 8) | (data2 << 16);
        this.module._mt32_send_midi(packed);
    }

    /**
     * Sends a SysEx byte array.
        * @param {Uint8Array} data The SysEx data to send.
     */
    public sendSysEx(data: Uint8Array): void {
        if (!this.module || !this.isInitialized) return;
        const ptr = this.module._malloc(data.length);
        this.module.HEAPU8.set(data, ptr);
        this.module._mt32_send_sysex(ptr, data.length);
        this.module._free(ptr);
    }

    /**
     * Renders PCM stereo audio frames directly into output channels.
      * @param {Float32Array} outLeft The output buffer for the left audio channel.
      * @param {Float32Array} outRight The output buffer for the right audio channel.
      * @param {number} frames The number of audio frames to render.
     */
    public renderAudio(outLeft: Float32Array, outRight: Float32Array, frames: number): void {
        if (!this.module || !this.isInitialized) return;

        this.module._mt32_render_audio(this.leftPtr, this.rightPtr, frames);

        const leftHeap = this.module.HEAPF32.subarray(
            this.leftPtr >> 2,
            (this.leftPtr >> 2) + frames,
        );
        const rightHeap = this.module.HEAPF32.subarray(
            this.rightPtr >> 2,
            (this.rightPtr >> 2) + frames,
        );

        outLeft.set(leftHeap);
        outRight.set(rightHeap);
    }

    /**
     * Releases WASM memory and destroys the synth context.
     */
    public dispose(): void {
        if (this.module) {
            if (this.leftPtr) this.module._free(this.leftPtr);
            if (this.rightPtr) this.module._free(this.rightPtr);
            this.module._mt32_free();
            this.module = null;
        }
        this.isInitialized = false;
    }
}
