import { CommandInterface } from "emulators";
import { Cache, CacheNoop } from "./host/lcache";

export interface LoadedBundle {
    bundleUrl: string | null,
    bundleChangesUrl: string | null,
    bundle: Uint8Array | null,
    bundleChanges: Uint8Array | null,
}

export const nonSerializableStore: {
    root: HTMLDivElement,
    loadedBundle: LoadedBundle | null,
    ci: CommandInterface | null,
    cache: Cache,
} = {
    root: null as any,
    loadedBundle: null,
    ci: null,
    cache: new CacheNoop(),
};
