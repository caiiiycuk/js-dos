import { Mt32Engine } from "./Mt32Engine";
import { MidiStreamParser } from "../midi-stream-parser";

if (typeof window !== "undefined") {
    window.addEventListener("mt32-midi-byte", ((e: CustomEvent) => {
        feedMidiByte(e.detail);
    }) as EventListener);
}

// Global MT-32 engine and parser instance
let mt32Engine: Mt32Engine | null = null;
let midiParser: MidiStreamParser | null = null;
let audioCtx: AudioContext | null = null;
let scriptNode: ScriptProcessorNode | null = null;

export async function initMt32Integration(): Promise<void> {
    if (mt32Engine) return; // If it’s already loaded, don’t repeat it.

    console.log("[MT-32] Initializing Roland MT-32 Synthesizer...");

    try {
        // 1. Loading Roland ROM files via fetch from public/emulators/mt32/
        const [ctrlResp, pcmResp] = await Promise.all([
            fetch("/emulators/mt32/MT32_CONTROL.ROM"),
            fetch("/emulators/mt32/MT32_PCM.ROM"),
        ]);

        if (!ctrlResp.ok || !pcmResp.ok) {
            throw new Error("Failed to load MT-32 ROM files from /emulators/mt32/");
        }

        const controlRom = await ctrlResp.arrayBuffer();
        const pcmRom = await pcmResp.arrayBuffer();

        // 2. Dynamically load the mt32emu.js script created by Emscripten from the public folder
        const moduleFactory = await loadMt32Factory();

        // 3. Creating and initiating Mt32Engine
        mt32Engine = new Mt32Engine();
        const sampleRate = 44100;

        await mt32Engine.init(moduleFactory, controlRom, pcmRom, {
            sampleRate,
            wasmBinaryPath: "/emulators/mt32/mt32emu.wasm",
        });

        // 4. Creating MidiStreamParser and connecting it to engine methods
        midiParser = new MidiStreamParser(
            (status, data1, data2) => {
                mt32Engine?.sendMidiShort(status, data1, data2);
            },
            (sysexData) => {
                mt32Engine?.sendSysEx(sysexData);
            },
        );

        // 5. Initializing the Web Audio API (using ScriptProcessorNode for a stable stream)
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });

        // It is necessary to wake up the AudioContext if the browser has blocked it.
        if (audioCtx.state === "suspended") {
            await audioCtx.resume();
            console.log("[MT-32 Audio] AudioContext resumed, state:", audioCtx.state);
        }

        // 4096 frames buffer ensures smooth playback without dropouts
        scriptNode = audioCtx.createScriptProcessor(4096, 0, 2);

        // let logCounter = 0;
        scriptNode.onaudioprocess = (e) => {
            const outLeft = e.outputBuffer.getChannelData(0);
            const outRight = e.outputBuffer.getChannelData(1);
            const frames = e.outputBuffer.length;

            if (mt32Engine) {
                mt32Engine.renderAudio(outLeft, outRight, frames);

                /*
                if (logCounter++ % 200 === 0) {
                    const sampleVal = outLeft[0];
                    if (sampleVal !== 0) {
                        console.log("[MT-32 Audio] Active sound sample generated:", sampleVal);
                    }
                }
                */
            } else {
                outLeft.fill(0);
                outRight.fill(0);
            }
        };

        scriptNode.connect(audioCtx.destination);
        console.log("[MT-32] Synthesizer successfully initialized and audio pipeline active!");
    } catch (e) {
        console.error("[MT-32] Initialization failed:", e);
    }
}

/**
 * Helper function that loads the mt32emu.js factory from the public directory
 */
async function loadMt32Factory(): Promise<any> {
    const existingFactory = (window as any).createMT32Module || (window as any).Module;
    if (typeof existingFactory === "function") {
        return existingFactory;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/emulators/mt32/mt32emu.js";
        script.onload = () => {
            const createModule = (window as any).createMT32Module || (window as any).Module;
            if (typeof createModule === "function") {
                resolve(createModule);
            } else {
                reject(new Error("Failed to find createMT32Module on window object after script load"));
            }
        };
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
}

/**
 * A function called from worker.ts when a new MIDI byte is received
 * @param {number} byte MIDI byte
 */
export function feedMidiByte(byte: number): void {
    // console.log("[MT-32] Raw byte received:", byte.toString(16));
    if (midiParser) {
        midiParser.feedByte(byte);
    } else {
        console.warn("[MT-32] midiParser is null when trying to feed byte!");
    }
}

export function disposeMt32(): void {
    if (scriptNode) {
        scriptNode.disconnect();
        scriptNode = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    if (mt32Engine) {
        mt32Engine.dispose();
        mt32Engine = null;
    }
    midiParser = null;
}
