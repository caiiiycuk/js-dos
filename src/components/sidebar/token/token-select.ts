import { createTokenEndpoint, tokeInfoGetEndpoint } from "../../../backend/v7/v7-config";
import { useState } from "preact/hooks";
import { TokenProps } from "./token";
import { request } from "../../../request";
import { html } from "../../../dom";
import { Icons } from "../../../icons";

export function TokenSelect(props: TokenProps) {
    const [token, setToken] = useState<string>(props.networkToken ?? "");
    const [error, setError] = useState<string | null>(null);
    const [awaitingToken, setAwaitingToken] = useState<boolean>(false);

    const generateNewToken = token === props.networkToken || token === "";

    function onChange(e: any) {
        setToken((e.currentTarget.value as string ?? "").toLowerCase().trim());
    }

    function onKeyDown(e: any) {
        e.stopPropagation();
    }

    function onKeyUp(e: any) {
        onChange(e);

        if (e.key === "Enter") {
            changeToken();
        }

        e.stopPropagation();
    }

    async function changeToken() {
        setAwaitingToken(true);

        try {
            if (generateNewToken) {
                if (props.networkToken === null ||
                    window.confirm("Are you sure want to create token?") === true) {
                    await createToken();
                }

                return;
            }

            const newToken = token.length === 0 ? null : token;
            if (newToken === props.networkToken) {
                return;
            }


            if (window.confirm(
                newToken === null ?
                    "Are you sure want to reset?" :
                    "Are you sure want to switch token?") === true) {
                if (newToken !== null) {
                    await checkToken(newToken);
                }

                props.setNetworkToken(token);
            }
        } catch (e: any) {
            setError("Token error: " + e.message);
        } finally {
            setAwaitingToken(false);
        }
    }

    async function checkToken(token: string) {
        await request(tokeInfoGetEndpoint + "?token=" + token);
    }

    async function createToken() {
        if (awaitingToken || props.region === null) {
            setError("region is not selected");
            return;
        }

        setError(null);
        setAwaitingToken(true);

        const clientId = props.clientId ?? props.anonymousClientId;
        try {
            const response: {
                token: string,
            } = await request(createTokenEndpoint, "POST", JSON.stringify({
                namespace: clientId.namespace,
                id: clientId.id,
                region: props.region,
            }));

            props.setNetworkToken(response.token);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setAwaitingToken(false);
        }
    }

    return html`
        <div class="font-bold">Token:</div>

        ${ awaitingToken ?
        html`
            <div class="col-span-2">
                <${Icons.Refresh} class="w-6 h-6 animate-reverse-spin" />
            </div>
        ` :
        html`
        <div class="flex flex-row">
            <input class="rounded border ${ token === "" ? "border-red-600" : "border-green-200"} 
                px-2 w-14 flex-grow mr-2" type="text" value=${token} 
                onChange=${onChange} onKeyUp=${onKeyUp} onKeyDown=${onKeyDown} />
            <div class="h-6 w-6 cursor-pointer ${generateNewToken ? "text-green-400 hover:text-green-600" : ""}" 
                onClick=${changeToken}>
                <${generateNewToken ? Icons.Plus : Icons.SwithcHorizontal} 
                    class="h-6 w-6" />
            </div>
        </div>
        `}
        
        ${ error ?
        html`
            <div class="text-red-400 col-span-2">${error}</div>
        ` : null}
    `;
}
