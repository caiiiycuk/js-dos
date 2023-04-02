import { createSlice } from "@reduxjs/toolkit";
import { nonSerializableStore } from "../non-serializable-store";
import { getCache } from "../host/lcache";

export interface Token {
    access_token: string,
    refresh_token: string,
    scope: string,
    expires_in: number,
    validUntilMs: number;
};

export interface Account {
    email: string,
    name: null | string,
    picture: null | string,
    token: Token,
    premium: boolean,
};

const initialState: {
    account: Account | null,
    ready: boolean,
} = {
    account: null,
    ready: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: { payload: Account }) => {
            state.account = action.payload;
            getCache(state.account.email)
                .then((cache) => nonSerializableStore.cache = cache)
                .catch(console.error);
        },
        logout: (state) => {
            postAuthMessage({
                action: "auth/logout",
            });
            getCache("guest")
                .then((cache) => nonSerializableStore.cache = cache)
                .catch(console.error);
            state.account = null;
        },
        ready: (state) => {
            state.ready = true;
        },
    },
});

function postAuthMessage(message: { action: "auth/login" | "auth/logout" }) {
    document.querySelector<HTMLIFrameElement>("#authentificator")!
        .contentWindow?.postMessage(message, "*");
}
