import { CommandInterface } from "emulators";
import { Cache, CacheNoop } from "./host/lcache";
import { Dispatch } from "@reduxjs/toolkit";
import { DosOptions } from "./public/types";

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

export const postJsDosEvent: DosOptions["onEvent"] = (event, ci) => {
    if (nonSerializableStore.options.onEvent) {
        setTimeout(() => {
            nonSerializableStore.options.onEvent?.(event, ci);
        }, 4);
    }
};