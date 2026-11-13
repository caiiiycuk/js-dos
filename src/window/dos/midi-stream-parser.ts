export class MidiStreamParser {
    private sysexBuffer: number[] = [];
    private inSysex: boolean = false;
    private runningStatus: number = 0;
    private expectedDataBytes: number = 0;
    private currentMessage: number[] = [];

    constructor(private onMidiShort: (status: number, data1: number, data2: number) => void,
                private onSysEx: (data: Uint8Array) => void) {}

    public feedByte(byte: number): void {
        // SysEx start (0xF0)
        if (byte === 0xF0) {
            this.inSysex = true;
            this.sysexBuffer = [0xF0];
            return;
        }

        // SysEx end (0xF7)
        if (this.inSysex) {
            this.sysexBuffer.push(byte);
            if (byte === 0xF7) {
                this.inSysex = false;
                // console.log("[MIDI Parser] SysEx message received, length:", this.sysexBuffer.length);
                this.onSysEx(new Uint8Array(this.sysexBuffer));
                this.sysexBuffer = [];
            }
            return;
        }

        // Real-time / System Common messages (ignored or processed separately)
        if (byte >= 0xF8) {
            return;
        }

        // Status byte (>= 0x80)
        if (byte & 0x80) {
            this.runningStatus = byte;
            this.currentMessage = [byte];
            this.expectedDataBytes = this.getDataByteCount(byte);
            if (this.expectedDataBytes === 0) {
                this.dispatchMessage();
            }
            return;
        }

        // Data byte (< 0x80)
        if (this.runningStatus !== 0) {
            this.currentMessage.push(byte);
            if (this.currentMessage.length - 1 === this.expectedDataBytes) {
                this.dispatchMessage();
                // Maintain Running Status (when status byte is omitted in subsequent messages)
                this.currentMessage = [this.runningStatus];
            }
        }
    }

    private getDataByteCount(status: number): number {
        const cmd = status & 0xF0;
        switch (cmd) {
            case 0x80: // Note Off
            case 0x90: // Note On
            case 0xA0: // Poly Aftertouch
            case 0xB0: // Control Change
            case 0xE0: // Pitch Bend
                return 2;
            case 0xC0: // Program Change
            case 0xD0: // Channel Pressure
                return 1;
            case 0xF0:
                // System messages
                if (status === 0xF3) return 1;
                if (status === 0xF2) return 2;
                return 0;
            default:
                return 0;
        }
    }

    private dispatchMessage(): void {
        if (this.currentMessage.length >= 2) {
            const status = this.currentMessage[0];
            const data1 = this.currentMessage[1] ?? 0;
            const data2 = this.currentMessage[2] ?? 0;
            // console.log("[MIDI Parser] Short message:", status.toString(16), data1, data2);
            this.onMidiShort(status, data1, data2);
        }
    }
}
