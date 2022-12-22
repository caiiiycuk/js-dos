import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./app";
import { authSlice } from "./auth/auth";
import { dosSlice } from "./dos/dom/dos";
import { i18nSlice } from "./i18n";

export function makeStore() {
    return configureStore({
        reducer: {
            i18n: i18nSlice.reducer,
            auth: authSlice.reducer,
            app: appSlice.reducer,
            dos: dosSlice.reducer,
        },
    });
};

export const store = makeStore();

export type State = ReturnType<typeof store.getState>;
