import { store } from "../store";
import { endpoint } from "./config";

export async function getChangesUrl(url: string) {
    const account = store.getState().auth.account;
    return getChangesUrlPrefix(account?.email) + encodeURIComponent(url) + ".zip";
}

export function getChangesUrlPrefix(domain: string | undefined | null) {
    return endpoint + "/changes/" + (domain ?? "guest") + "/";
}
