import { createSlice } from "@reduxjs/toolkit";
import { getCache } from "../host/lcache";
import { lStorage } from "../host/lstorage";
import { DosAction, getNonSerializableStore } from "../store";
import { dosSlice } from "./dos";

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

const initAccount = (() => {
    const params = new URLSearchParams(location.search);
    const refreshToken = params.get("jsdos_token");
    if (refreshToken !== null) {
        setRefreshToken(refreshToken);
        history.replaceState(null, "", location.href.substring(0, location.href.indexOf("?")));
        return null;
    } else {
        const json = lStorage.getItem(cachedAccount);
        const account = json !== null ? JSON.parse(json) : null;
        return account !== null && account.token.validUntilMs - Date.now() > 1 * 60 * 60 * 1000 ?
            account : null;
    }
})();

const initialState: {
    loginUrl: string,
    account: Account | null,
    ready: boolean,
} = {
    loginUrl: location.href,
    account: initAccount,
    ready: initAccount !== null,
};

export type AuthState = typeof initialState;

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: { payload: Account }) => {
            setRefreshToken(action.payload.token.refresh_token);
            state.account = action.payload;
            state.account.premium = state.account.premium ||
                state.account.email === "dz.caiiiycuk@gmail.com";
            lStorage.setItem(cachedAccount, JSON.stringify(action.payload));
            (action as unknown as DosAction).asyncStore((store) => {
                if (action.payload.email === "dz.caiiiycuk@gmail.com") {
                    store.dispatch(dosSlice.actions.setSockdriveWrite(false));
                }
                getCache(action.payload.email)
                    .then((cache) => getNonSerializableStore(store).cache = cache)
                    .catch(console.error)
                    .finally(() => {
                        store.dispatch(authSlice.actions.ready());
                    });
            });
        },
        logout: (state, action) => {
            clearRefreshToken();
            lStorage.removeItem(cachedAccount);
            (action as unknown as DosAction).asyncStore((store) => {
                getCache("guest")
                    .then((cache) => getNonSerializableStore(store).cache = cache)
                    .catch(console.error);
            });
            state.account = null;
        },
        ready: (state) => {
            state.ready = true;
        },
        setLoginUrl: (state, action: { payload: string }) => {
            state.loginUrl = action.payload;
        },
    },
});

export function getRefreshToken(): string | null {
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
