import { createSlice } from "@reduxjs/toolkit";
import { getCache } from "../host/lcache";
import { lStorage } from "../host/lstorage";
import { DosAction, getNonSerializableStore } from "../store";
import { tokenGet } from "../v8/config";
import { dosSlice } from "./dos";

const cachedAccount = "cached.jsdos.account";

export interface Account {
    token: string,
    name: string,
    email: string,
    premium: boolean,
};

const initAccount = (() => {
    const json = lStorage.getItem(cachedAccount);
    if (json) {
        const account = JSON.parse(json);
        if (account.email && account.email.length > 0 && account.token && account.token.length === 5) {
            return account;
        }
    }
    return null;
})();

const initialState: {
    account: Account | null,
} = {
    account: initAccount,
};

export type AuthState = typeof initialState;

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAccount: (state, action: { payload: Account | null }) => {
            const account = action.payload;
            if (account !== null) {
                lStorage.setItem(cachedAccount, JSON.stringify(account));
                (action as unknown as DosAction).asyncStore((store) => {
                    if (account.email === "dz.caiiiycuk@gmail.com") {
                        store.dispatch(dosSlice.actions.setSockdriveWrite(false));
                    }
                    getCache(account.email)
                        .then((cache) => getNonSerializableStore(store).cache = cache)
                        .catch(console.error);
                });
            } else {
                lStorage.removeItem(cachedAccount);
                (action as unknown as DosAction).asyncStore((store) => {
                    getCache("guest")
                        .then((cache) => getNonSerializableStore(store).cache = cache)
                        .catch(console.error);
                });
            }
            state.account = account;
        },
    },
});

export async function loadAccount(token: string) {
    if (!token || token.length !== 5) {
        return { token, account: null };
    }

    for (let i = 0; i < token.length; ++i) {
        const code = token.charCodeAt(i);
        if (!(code > 96 && code < 123)) { // lower alpha (a-z)
            return { token, account: null };
        }
    }

    const account = await (await fetch(tokenGet + "?id=" + token)).json();
    delete account.success;

    return { token, account: account.email ? account : null };
}
