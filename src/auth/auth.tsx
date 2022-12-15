import { auth } from "../conf";

const revalidateTimeout = 30 * 60 * 1000; // 30 min

interface Token {
    access_token: string,
    refresh_token: string,
    scope: string,
    expires_in: number,
    validUntilMs: number;
}

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
        const response = await fetch("https://login.xsolla.com/api/oauth2/token", {
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


export async function refreshToken(): Promise<Token | null> {
    try {
        const value: string | null = localStorage.getItem("token");
        if (value !== null) {
            const token: Token = JSON.parse(value);

            if (token.validUntilMs - Date.now() > revalidateTimeout) {
                return token;
            }

            const response = await fetch("https://login.xsolla.com/api/oauth2/token", {
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
    localStorage.setItem("token", JSON.stringify(token));
    return token;
}
