import { Dispatch } from "@reduxjs/toolkit";
import { NonSerializableStore, State } from "./store";
import { getT } from "./i18n";
import { putChanges } from "./v8/changes";
import { uiSlice } from "./store/ui";
import { Account } from "./store/auth";

export async function apiSave(state: State,
                              nonSerializableStore: NonSerializableStore,
                              dispatch: Dispatch): Promise<boolean> {
    const ci = nonSerializableStore.ci;
    const changesUrl = nonSerializableStore.loadedBundle?.bundleChangesUrl;
    if (ci === null || !changesUrl || !state.ui.cloudSaves) {
        return false;
    }

    const t = getT(state);
    const account = state.auth.account;
    try {
        const changes = await ci.persist(true);
        if (changes !== null) {
            if (canDoCloudSaves(account)) {
                await putChanges(changesUrl, changes);
            } else {
                await nonSerializableStore.cache.put(changesUrl, changes);
            }
        }

        if (account === null || account.email === null) {
            dispatch(uiSlice.actions.showToast({
                message: t("warn_save"),
                intent: "success",
            }));
        } else {
            dispatch(uiSlice.actions.showToast({
                message: t("success_save"),
                intent: "success",
            }));
        }

        return true;
    } catch (e: any) {
        dispatch(uiSlice.actions.showToast({
            message: t("unable_to_save"),
            intent: "error",
        }));
        console.error(e);

        return false;
    }
}

export function isSockdrivePremium(sockdriveEndpoint: string, account: Account | null): Promise<boolean> {
    if (account) {
        return fetch(sockdriveEndpoint + "/premium/" + account.email)
            .then((r) => r.json())
            .then((payload: { premium: boolean }) => payload.premium);
    } else {
        return Promise.resolve(false);
    }
}

export function canDoCloudSaves(account: Account | null) {
    return account?.email !== undefined;
}
