import { configureStore } from "@reduxjs/toolkit";
import { uiSlice } from "./ui";
import { authSlice } from "./auth/auth";
import { dosSlice } from "./dos";
import { i18nSlice } from "./i18n";
import { storageSlice } from "./storage/bundle-storage";

export function makeStore() {
    return configureStore({
        reducer: {
            i18n: i18nSlice.reducer,
            auth: authSlice.reducer,
            ui: uiSlice.reducer,
            dos: dosSlice.reducer,
            storage: storageSlice.reducer,
        },
    });
};

export const store = makeStore();

export type State = ReturnType<typeof store.getState>;
