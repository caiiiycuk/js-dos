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
    if (ci === null || !changesUrl || !state.ui.canSave) {
        return false;
    }

    const t = getT(state);
    const account = state.auth.account;
    try {
        let savedInIndexedDb = true;
        const warnText =
            (account === null || account.email === null) ? t("warn_save_no_account") :
                (!account.premium) ? t("warn_save_no_premium") :
                    t("warn_save_big_file");

        const changes = await ci.persist(true);
        if (changes !== null) {
            if (canDoCloudSave(account, changes)) {
                await putChanges(changesUrl, changes);
                savedInIndexedDb = false;
            } else {
                await nonSerializableStore.cache.put(changesUrl, changes);
            }
        }

        if (savedInIndexedDb) {
            dispatch(uiSlice.actions.showToast({
                message: warnText,
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

export function canDoCloudSave(account: Account | null, changes: Uint8Array | null) {
    if (account) {
        return account.email !== undefined &&
            (account.email === "dz.caiiiycuk@gmail.com" || account.premium === true) &&
            (changes === null || changes.length <= 25 * 1024 * 1024);
    }
    return false;
}
