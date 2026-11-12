import type { CommandInterface } from "emulators";

const exits = new WeakMap<CommandInterface, Promise<void>>();

export function apiExit(ci: CommandInterface | null | undefined): Promise<void> {
    if (!ci) {
        return Promise.resolve();
    }
    let result = exits.get(ci);
    if (!result) {
        // SAFETY: UI unmount, editor replacement and stop can exit the same CI concurrently.
        result = Promise.resolve().then(() => ci.exit());
        exits.set(ci, result);
    }
    return result;
}
