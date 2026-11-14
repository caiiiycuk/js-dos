export interface EmscriptenModuleInstance {
    _malloc(size: number): number;
    _free(ptr: number): void;
    _mt32_init(sampleRate: number): number;
    _mt32_load_roms(ctrlPtr: number, ctrlLen: number, pcmPtr: number, pcmLen: number): number;
    _mt32_send_midi(msg: number): void;
    _mt32_send_sysex(ptr: number, len: number): void;
    _mt32_render_audio(outLPtr: number, outRPtr: number, frames: number): void;
    _mt32_free(): void;
    HEAPU8: Uint8Array;
    HEAPF32: Float32Array;
}

export interface Mt32ModuleFactory {
    (options?: { locateFile?: (path: string) => string }): Promise<EmscriptenModuleInstance>;
}

export interface Mt32EngineOptions {
    sampleRate?: number;
    wasmBinaryPath?: string;
}
