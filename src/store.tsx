import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./app";
import { authSlice } from "./auth/auth";

export function makeStore() {
    return configureStore({
        reducer: {
            auth: authSlice.reducer,
            app: appSlice.reducer,
        },
    });
};

export const store = makeStore();

export type State = ReturnType<typeof store.getState>;
