import { CommandInterface, Logger } from "../../../emulators";
import { WasmModule } from "../../../impl/modules";
export default function DosDirect(wasm: WasmModule, bundle: Uint8Array, logger: Logger): Promise<CommandInterface>;
