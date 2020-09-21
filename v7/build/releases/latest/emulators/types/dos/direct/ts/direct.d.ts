import { CommandInterface } from "../../../emulators";
import { WasmModule } from "../../../impl/modules";
export default function DosDirect(wasm: WasmModule, bundle: Uint8Array): Promise<CommandInterface>;
