import { useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { LockBadge } from "../components/lock";
import { nonSerializableStore } from "../non-serializable-store";
import { State } from "../store";
import { uiSlice } from "../store/ui";
import { DisketteIcon } from "./diskette-icon";
import { useT } from "../i18n";
import { putChanges } from "../v8/changes";

export function CloudSaveButton(props: {
    class?: string,
}) {
    const [busy, setBusy] = useState<boolean>(false);
    const account = useSelector((state: State) => state.auth.account);
    const disabled = account === null;
    const dispatch = useDispatch();
    const t = useT();
    const cloudSaves = useSelector((state: State) => state.ui.cloudSaves);

    if (!cloudSaves ||
        nonSerializableStore.loadedBundle === null ||
        nonSerializableStore.loadedBundle.bundleChangesUrl === null) {
        return null;
    }

    async function onClick() {
        if (disabled) {
            dispatch(uiSlice.actions.modalLogin());
            return;
        }

        if (busy) {
            return;
        }

        const ci = nonSerializableStore.ci;
        const changesUrl = nonSerializableStore.loadedBundle?.bundleChangesUrl;

        if (ci === null || !changesUrl) {
            return;
        }

        setBusy(true);
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

            dispatch(uiSlice.actions.showToast({
                message: t("success"),
                intent: "success",
            }));
        } catch (e: any) {
            dispatch(uiSlice.actions.showToast({
                message: t("unable_to_save"),
                intent: "error",
            }));
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    return <div class={"save-button sidebar-button overflow-hidden " +
        (busy ? " sidebar-highlight " : "") + props.class +
        (disabled ? " opacity-50" : "")} onClick={onClick}>
        <div class="w-full h-full flex justify-center">
            <DisketteIcon />
            {busy && <div class="sidebar-badge" />}
            {disabled && <LockBadge />}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor"
                class="absolute bottom-1 w-3 h-3 text-primary-content">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775
                    5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
        </div>
    </div >;
}
