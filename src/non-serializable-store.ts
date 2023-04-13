import { CommandInterface } from "emulators";
import { Cache, CacheNoop } from "./host/lcache";
import { Dispatch } from "@reduxjs/toolkit";
import { DosOptions } from "./main";

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
    options: Partial<DosOptions>,
} = {
    root: null as any,
    dispatch: null,
    loadedBundle: null,
    ci: null,
    cache: new CacheNoop(),
    options: {},
};
