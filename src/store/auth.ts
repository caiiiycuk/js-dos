import { createSlice } from "@reduxjs/toolkit";
import { nonSerializableStore } from "../non-serializable-store";
import { getCache } from "../host/lcache";
import { lStorage } from "../host/lstorage";

const cachedAccount = "cached.account";

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

const initAccountJson = lStorage.getItem(cachedAccount);
const initAccount = initAccountJson !== null ? JSON.parse(initAccountJson) : null;

const initialState: {
    account: Account | null,
    ready: boolean,
} = {
    account: initAccount !== null && initAccount.token.validUntilMs - Date.now() > 1 * 60 * 60 * 1000 ?
        initAccount : null,
    ready: false,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: { payload: Account }) => {
            setRefreshToken(action.payload.token.refresh_token);
            state.account = action.payload;
            state.account.premium = state.account.premium || state.account.email === "dz.caiiiycuk@gmail.com";
            lStorage.setItem(cachedAccount, JSON.stringify(action.payload));
            getCache(state.account.email)
                .then((cache) => nonSerializableStore.cache = cache)
                .catch(console.error)
                .finally(() => {
                    nonSerializableStore.dispatch!(authSlice.actions.ready());
                });
        },
        logout: (state) => {
            clearRefreshToken();
            lStorage.removeItem(cachedAccount);
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

export function postAuthMessage(action: "auth/login" | "auth/authenicate") {
    const message = {
        action,
        refresh_token: action === "auth/authenicate" ? getRefreshToken() : undefined,
        url: action === "auth/login" ? location.href : undefined,
    };
    document.querySelector<HTMLIFrameElement>("#authentificator")!
        .contentWindow?.postMessage(message, "*");
}

function getRefreshToken(): string | null {
    return lStorage.getItem("cached.rt");
}

function setRefreshToken(refreshToken: string | null) {
    if (refreshToken === null) {
        clearRefreshToken();
        return;
    }

    return lStorage.setItem("cached.rt", refreshToken);
}

function clearRefreshToken() {
    lStorage.removeItem("cached.rt");
}

const params = new URLSearchParams(location.search);
const refreshToken = params.get("jsdos_token");
if (refreshToken !== null) {
    params.delete("jsdos_token");
    location.search = params.toString();
    setRefreshToken(refreshToken);
}
