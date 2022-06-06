import { DosConfig } from "./dos-conf";
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
    constructor(libzipWasm: WasmModule);
    autoexec(...lines: string[]): DosBundle;
    cycles(cycles: string): DosBundle;
    extract(url: string, path?: string, type?: "zip"): DosBundle;
    extractAll(sources: DosArchiveSource[]): DosBundle;
    toUint8Array(overwriteConfig?: boolean): Promise<Uint8Array>;
}
