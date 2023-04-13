import { CommandInterface } from "emulators";
import { Cache, CacheNoop } from "./host/lcache";
import { Dispatch } from "@reduxjs/toolkit";

export interface LoadedBundle {
    bundleUrl: string | null,
    bundleChangesUrl: string | null,
    bundle: Uint8Array | null,
    bundleChanges: Uint8Array | null,
}

export const nonSerializableStore: {
    root: HTMLDivElement,
    dispatch: Dispatch | null,
    loadedBundle: LoadedBundle | null,
    ci: CommandInterface | null,
    cache: Cache,
    onEvent: (event: "emu-ready" | "ci-ready", ci?: CommandInterface) => void,
} = {
    root: null as any,
    dispatch: null,
    loadedBundle: null,
    ci: null,
    cache: new CacheNoop(),
    onEvent: () => {/**/},
};
