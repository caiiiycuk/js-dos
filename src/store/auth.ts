import { createSlice } from "@reduxjs/toolkit";
import { nonSerializableStore } from "../non-serializable-store";
import { getCache } from "../host/lcache";
import { lStorage } from "../host/lstorage";

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

const cachedEmailKey = "cached.email";

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: { payload: Account }) => {
            state.account = action.payload;
            lStorage.setItem(cachedEmailKey, action.payload.email);
            getCache(state.account.email)
                .then((cache) => nonSerializableStore.cache = cache)
                .catch(console.error)
                .finally(() => {
                    nonSerializableStore.dispatch!(authSlice.actions.ready());
                });
        },
        logout: (state) => {
            postAuthMessage({
                action: "auth/logout",
            });
            lStorage.removeItem(cachedEmailKey);
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

export function getCachedEmail() {
    return lStorage.getItem(cachedEmailKey);
}

function postAuthMessage(message: { action: "auth/login" | "auth/logout" }) {
    document.querySelector<HTMLIFrameElement>("#authentificator")!
        .contentWindow?.postMessage(message, "*");
}
