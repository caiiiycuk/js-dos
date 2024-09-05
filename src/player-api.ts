import { Dispatch } from "@reduxjs/toolkit";
import { NonSerializableStore, State } from "./store";
import { getT } from "./i18n";
import { putChanges } from "./v8/changes";
import { uiSlice } from "./store/ui";

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
            if (account === null || !account.premium) {
                await nonSerializableStore.cache.put(changesUrl, changes);
            } else {
                await Promise.all([
                    putChanges(changesUrl, changes),
                    nonSerializableStore.cache.put(changesUrl, changes),
                ]);
            }
        }

        if (account === null || account.email === null) {
            dispatch(uiSlice.actions.showToast({
                message: t("warn_save"),
                intent: "warning",
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
