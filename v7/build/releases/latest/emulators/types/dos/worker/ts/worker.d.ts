import { CommandInterface } from "../../../emulators";
import { WasmModule } from "../../../impl/modules";
export default function DosWorker(workerUrl: string, wasm: WasmModule, bundle: Uint8Array): Promise<CommandInterface>;
