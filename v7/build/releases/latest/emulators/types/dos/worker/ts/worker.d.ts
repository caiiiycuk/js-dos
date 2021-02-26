import { CommandInterface } from "../../../emulators";
import { WasmModule } from "../../../impl/modules";
export default function DosWorker(workerUrl: string, wasm: WasmModule, bundles: Uint8Array[]): Promise<CommandInterface>;
