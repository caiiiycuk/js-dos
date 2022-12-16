import { configureStore } from "@reduxjs/toolkit";
import { appSlice } from "./app";
import { authSlice } from "./auth/auth";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        app: appSlice.reducer,
    },
});

export type State = ReturnType<typeof store.getState>;
