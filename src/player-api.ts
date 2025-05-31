import { Dispatch } from "@reduxjs/toolkit";
import { NonSerializableStore, State } from "./store";
import { getT } from "./i18n";
import { putChanges } from "./v8/changes";
import { uiSlice } from "./store/ui";
import { Account } from "./store/auth";
import { PersistedSockdrives } from "emulators";
import { idbSockdrive } from "./host/idb";
import { CommandInterface } from "emulators";

export async function apiSave(state: State,
                              nonSerializableStore: NonSerializableStore,
                              dispatch: Dispatch,
                              emulationEnded: boolean = false,
                              encodedChanges: Uint8Array | null = null): Promise<boolean> {
    const ci = nonSerializableStore.ci;
    const changesUrl = nonSerializableStore.loadedBundle?.bundleChangesUrl;
    if ((ci === null && encodedChanges === null) || !changesUrl || !state.ui.canSave) {
        return false;
    }

    const t = getT(state);
    const account = state.auth.account;
    try {
        dispatch(uiSlice.actions.showToast({
            message: t("saving_game"),
            intent: "none",
            long: true,
        }));

        let savedInIndexedDb = true;
        const warnText =
            (account === null || account.email === null) ? t("warn_save_no_account") :
                (!account.premium) ? t("warn_save_no_premium") :
                    t("warn_save_big_file");

        let warnAboutSaves = false;
        if (encodedChanges === null) {
            const changes = await ci!.persist(true);
            encodedChanges = encodeChanges(changes);
            warnAboutSaves = encodedChanges !== changes && !emulationEnded;
        }
        if (encodedChanges !== null) {
            if (warnAboutSaves) {
                dispatch(uiSlice.actions.showToast({
                    message: t("sockdrive_save_in_the_middle"),
                    intent: "warning",
                    long: true,
                }));
            }

            if (canDoCloudSave(account, encodedChanges)) {
                await putChanges(changesUrl, encodedChanges);
                savedInIndexedDb = false;
            } else {
                await nonSerializableStore.cache.put(changesUrl, encodedChanges);
            }
        }

        if (encodedChanges === null) {
            dispatch(uiSlice.actions.showToast({
                message: t("no_changes_to_save"),
                intent: "warning",
                long: true,
            }));
        } else if (savedInIndexedDb) {
            setTimeout(() => {
                dispatch(uiSlice.actions.showToast({
                    message: warnText,
                    intent: "success",
                    long: true,
                }));
            }, warnAboutSaves ? 3000 : 4);
        } else {
            dispatch(uiSlice.actions.showToast({
                message: t("success_save"),
                intent: "success",
                long: true,
            }));
        }

        return true;
    } catch (e: any) {
        dispatch(uiSlice.actions.showToast({
            message: t("unable_to_save"),
            intent: "error",
            long: true,
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

export async function applySockdriveChanges(encoded: Uint8Array): Promise<boolean> {
    return traverseSockdriveChanges(encoded, async (url, persist) => {
        const idb = await idbSockdrive(url);
        await idb.put(0 as any, persist);
        idb.close();
    });
}

export async function traverseSockdriveChanges(encoded: Uint8Array,
                                               callback: (url: string, persist: Uint8Array) => Promise<void>) {
    const decoder = new TextDecoder();
    let offset = 0;
    while (offset < encoded.length) {
        const urlLength = readUint32(encoded, offset);
        offset += 4;

        if (urlLength > 4096) {
            return false;
        }

        const url = decoder.decode(encoded.slice(offset, offset + urlLength));

        if (!(url.startsWith("http://") || url.startsWith("https://"))) {
            return false;
        }

        offset += urlLength;

        const persistLength = readUint32(encoded, offset);
        offset += 4;

        const persist = encoded.slice(offset, offset + persistLength);
        offset += persistLength;
        await callback(url, persist);
    }

    return true;
}

function encodeChanges(changes: Uint8Array | PersistedSockdrives | null) {
    if (changes === null || changes instanceof Uint8Array) {
        return changes;
    }

    const encoder = new TextEncoder();

    const urls = [];
    let totalSize = 0;
    for (const { url, persist } of changes.drives) {
        urls.push(encoder.encode(url));
        totalSize += persist.length + urls[urls.length - 1].length + 8;
    }

    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (let i = 0; i < changes.drives.length; i++) {
        const url = urls[i];
        const persist = changes.drives[i].persist;

        offset = writeUint32(result, url.length, offset);
        result.set(url, offset);
        offset += url.length;

        offset = writeUint32(result, persist.length, offset);
        result.set(persist, offset);
        offset += persist.length;
    }

    return result;
}

export function writeUint32(container: Uint8Array, value: number, offset: number) {
    container[offset] = value & 0xFF;
    container[offset + 1] = (value & 0x0000FF00) >> 8;
    container[offset + 2] = (value & 0x00FF0000) >> 16;
    container[offset + 3] = (value & 0xFF000000) >> 24;
    return offset + 4;
}

export function readUint32(container: Uint8Array, offset: number) {
    return (container[offset] & 0x000000FF) |
        ((container[offset + 1] << 8) & 0x0000FF00) |
        ((container[offset + 2] << 16) & 0x00FF0000) |
        ((container[offset + 3] << 24) & 0xFF000000);
}

export function sendQuickSaveEvent(ci: CommandInterface) {
    ci.sendBackendEvent({
        type: "wc-trigger-event",
        event: "hand_savestate",
    });
}

export function sendQuickLoadEvent(ci: CommandInterface) {
    ci.sendBackendEvent({
        type: "wc-trigger-event",
        event: "hand_loadstate",
    });
}
