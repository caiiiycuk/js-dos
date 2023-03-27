import { store } from "../store";
import { endpoint } from "./config";

export async function getChangesUrl(url: string) {
    const account = store.getState().auth.account;
    const domain = account?.email || "guest";
    return endpoint + "/changes/" + domain + "/" + encodeURIComponent(url);
}
