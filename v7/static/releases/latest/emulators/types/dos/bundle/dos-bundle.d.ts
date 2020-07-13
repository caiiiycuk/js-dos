import { DosConfig } from "./dos-conf";
import { Cache } from "../../cache";
import { WasmModule } from "../../impl/modules";
export interface DosArchiveSource {
    url: string;
    path: string;
    type?: "zip";
}
export default class DosBundle {
    config: DosConfig;
    sources: DosArchiveSource[];
    private libzipWasm;
    private cache;
    constructor(libzipWasm: WasmModule, cache: Cache);
    autoexec(...lines: string[]): DosBundle;
    cycles(cycles: string): DosBundle;
    extract(url: string, path?: string, type?: "zip"): DosBundle;
    extractAll(sources: DosArchiveSource[]): DosBundle;
    toUint8Array(): Promise<Uint8Array>;
}
