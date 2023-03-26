import { auth, xsollaMe, xsollaOAuth2 } from "../conf";
import { createSlice } from "@reduxjs/toolkit";
import { makeStore } from "../store";
import { nonSerializableStore } from "../non-serializable-store";
import { havePremium } from "../subscriptions/subscriptions";
import { lStorage } from "../host/lstorage";
import { getCache } from "../host/lcache";

const revalidateTimeout = 30 * 60 * 1000; // 30 min

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
} = {
    account: {
        email: "caiiiycuk@gmail.com",
        name: null,
        picture: null,
        token: {} as any,
        premium: true,
    },
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: { payload: Account }) => {
            state.account = action.payload;
        },
        logout: (state) => {
            clearToken();
            state.account = null;
        },
    },
});

export async function initAuthToken(): Promise<Token | null> {
    const storedToken = await refreshToken();
    if (storedToken !== null) {
        return storedToken;
    }

    const params = new URLSearchParams(location.search);
    const authCode = params.get("code");
    const authState = params.get("state");
    const authScope = params.get("scope");

    if (authCode !== null && authState !== null && authScope !== null) {
        const response = await fetch(xsollaOAuth2, {
            method: "POST",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            },
            body: `client_id=${auth.clientId}&code=${authCode}&state=${authState}` +
                `&grant_type=authorization_code&scope=${authScope}&redirect_uri=${auth.callbackUrl}`,

        });

        try {
            return await proceedAuthResponse(response);
        } catch (e) {
            console.error("auth init error:", e);
        }
    }

    return null;
}

async function refreshToken(): Promise<Token | null> {
    try {
        const value: string | null = lStorage.getItem("token");
        if (value !== null) {
            const token: Token = JSON.parse(value);

            if (token.validUntilMs - Date.now() > revalidateTimeout) {
                return token;
            }

            const response = await fetch(xsollaOAuth2, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: `client_id=${auth.clientId}&refresh_token=${token.refresh_token}` +
                    `&grant_type=refresh_token&redirect_uri=${auth.callbackUrl}`,

            });

            return proceedAuthResponse(response);
        }

        return null;
    } catch (e) {
        console.log("Auth refresh token error: ", e);
        return null;
    }
}

async function proceedAuthResponse(response: Response): Promise<Token> {
    const token: Token = await response.json();

    if (typeof (token as any).error === "object") {
        throw new Error(JSON.stringify((token as any).error));
    }

    if (typeof token.access_token !== "string" ||
        typeof token.refresh_token !== "string" ||
        typeof token.expires_in !== "number") {
        throw new Error("Unknown auth response: " + JSON.stringify(token));
    }

    token.validUntilMs = Date.now() + (token.expires_in - 5) * 1000;
    lStorage.setItem("token", JSON.stringify(token));
    return token;
}

async function loadAccount(token: Token): Promise<Account> {
    const response = await fetch(xsollaMe, {
        method: "GET",
        cache: "no-cache",
        headers: {
            Authorization: token.access_token,
        },
    });

    const data = await response.json();
    if (typeof data.error !== "undefined") {
        clearToken();
        throw new Error(data.error.code + ": " + data.error.description);
    }

    let premium = false;
    try {
        premium = await havePremium(token.access_token);
    } catch (e) {
        console.error("Unknown preimium status", e);
    }

    return {
        token,
        name: data.name ?? data.first_name ?? null,
        email: data.email,
        picture: data.picture ?? null,
        premium,
    };
}

function clearToken() {
    lStorage.removeItem("token");
}

export function authenticate(store: ReturnType<typeof makeStore>) {
    store.dispatch(async (dispatch) => {
        try {
            const token = await initAuthToken();
            if (token === null) {
                nonSerializableStore.cache = await getCache("guest");
                return;
            }

            const account = await loadAccount(token);
            nonSerializableStore.cache = await getCache(account.email);
            dispatch(authSlice.actions.login(account));
        } catch (e) {
            console.error("initAuth", e);
            nonSerializableStore.cache = await getCache("guest");
        }
    });
}
