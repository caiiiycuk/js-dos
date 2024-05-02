import { ThunkMiddleware, configureStore } from "@reduxjs/toolkit";
import { UiState, uiSlice } from "./store/ui";
import { AuthState, authSlice } from "./store/auth";
import { DosState, dosSlice } from "./store/dos";
import { I18NState, i18nSlice } from "./i18n";
import { StorageState, storageSlice } from "./store/storage";
import { EditorState, editorSlice } from "./store/editor";

const asyncDispatchMiddleware: ThunkMiddleware<any> = (store) => (next) => (action) => {
    let syncActivityFinished = false;
    let actionQueue: any[] = [];

    function flushQueue() {
        actionQueue.forEach((a) => store.dispatch(a)); // flush queue
        actionQueue = [];
    }

    function asyncDispatch(asyncAction: any) {
        actionQueue = actionQueue.concat([asyncAction]);

        if (syncActivityFinished) {
            flushQueue();
        }
    }

    const actionWithAsyncDispatch =
      Object.assign({}, action, { asyncDispatch });

    next(actionWithAsyncDispatch);
    syncActivityFinished = true;
    flushQueue();
};


export function makeStore() {
    return configureStore({
        reducer: {
            i18n: i18nSlice.reducer,
            auth: authSlice.reducer,
            ui: uiSlice.reducer,
            dos: dosSlice.reducer,
            storage: storageSlice.reducer,
            editor: editorSlice.reducer,
        },
        middleware: (getDefault) => {
            const all = getDefault();
            all.push(asyncDispatchMiddleware);
            return all;
        },
    });
};

export interface State {
    ui: UiState,
    auth: AuthState,
    dos: DosState,
    i18n: I18NState,
    editor: EditorState,
    storage: StorageState,
}

export type Store = ReturnType<typeof makeStore>;
