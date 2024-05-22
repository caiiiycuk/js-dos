import { ThunkMiddleware, configureStore } from "@reduxjs/toolkit";
import { UiState, uiSlice } from "./store/ui";
import { AuthState, authSlice } from "./store/auth";
import { DosState, dosSlice } from "./store/dos";
import { I18NState, i18nSlice } from "./i18n";
import { StorageState, storageSlice } from "./store/storage";
import { EditorState, editorSlice } from "./store/editor";
import { DosEvent, DosOptions } from "./public/types";
import { CommandInterface, InitFs } from "emulators";
import { useStore } from "react-redux";
import { Cache, CacheNoop } from "./host/lcache";
import { InitState, createInitSlice } from "./store/init";

export interface LoadedBundle {
    bundleUrl: string | null,
    bundleChangesUrl: string | null,
    bundle: InitFs | null,
    bundleChanges: Uint8Array | null,
}

export interface NonSerializableStore {
    root: HTMLDivElement,
    loadedBundle: LoadedBundle | null,
    ci: CommandInterface | null,
    cache: Cache,
    options: Partial<DosOptions>,
}

export interface DosAction {
    asyncStore: (cakkback: (store: Store) => void) => void,
}

const dosMiddleware: ThunkMiddleware<any> = (store) => (next) => (action) => {
    function asyncStore(callback: (store: any) => void) {
        setTimeout(() => callback(store), 4);
    }

    const actionWithAsyncDispatch =
        Object.assign({}, action, { asyncStore });

    next(actionWithAsyncDispatch);
};

const nonSerializableStoreMap: { [uid: string]: NonSerializableStore } = {};

export function makeNonSerializableStore(options: Partial<DosOptions>): NonSerializableStore {
    return {
        root: null as any,
        loadedBundle: null,
        ci: null,
        cache: new CacheNoop(),
        options,
    };
}

export function makeStore(nonSerializableStore: NonSerializableStore) {
    const { storeUid, slice } = createInitSlice();
    const store = configureStore({
        reducer: {
            init: slice.reducer,
            i18n: i18nSlice.reducer,
            auth: authSlice.reducer,
            ui: uiSlice.reducer,
            dos: dosSlice.reducer,
            storage: storageSlice.reducer,
            editor: editorSlice.reducer,
        },
        middleware: (getDefault) => {
            const all = getDefault();
            all.push(dosMiddleware);
            return all;
        },
    });
    nonSerializableStoreMap[storeUid] = nonSerializableStore;
    return store;
};

export interface State {
    init: InitState,
    ui: UiState,
    auth: AuthState,
    dos: DosState,
    i18n: I18NState,
    editor: EditorState,
    storage: StorageState,
}

export type Store = ReturnType<typeof makeStore>;

export function getNonSerializableStore(storeOrState: any): NonSerializableStore {
    if (typeof storeOrState.getState === "function") {
        return nonSerializableStoreMap[storeOrState.getState().init.uid];
    } else {
        return nonSerializableStoreMap[storeOrState.init.uid];
    }
}

export function useNonSerializableStore() {
    return getNonSerializableStore(useStore());
}

export function postJsDosEvent(nonSerializableStore: NonSerializableStore, event: DosEvent, ci?: CommandInterface) {
    if (nonSerializableStore.options.onEvent) {
        setTimeout(() => {
            nonSerializableStore.options.onEvent?.(event, ci);
        }, 4);
    }
};