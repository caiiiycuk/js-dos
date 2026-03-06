import { Dispatch } from "@reduxjs/toolkit";
import { NonSerializableStore, State } from "./store";
import { getT } from "./i18n";
import { uiSlice } from "./store/ui";
import { CommandInterface } from "emulators";
import { putChanges } from "./host/opfs";

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
    try {
        dispatch(uiSlice.actions.showToast({
            message: t("saving_game"),
            intent: "none",
            long: true,
        }));

        let savedInIndexedDb = true;
        let warnAboutSaves = false;
        if (encodedChanges === null) {
            encodedChanges = await ci!.persist(true);
            warnAboutSaves = encodedChanges !== null &&
                !(encodedChanges[0] === 0x50 && encodedChanges[1] === 0x4b) && !emulationEnded;
        }
        if (encodedChanges !== null) {
            if (warnAboutSaves) {
                dispatch(uiSlice.actions.showToast({
                    message: t("sockdrive_save_in_the_middle"),
                    intent: "warning",
                    long: true,
                }));
            }

            if (nonSerializableStore.options.fsChanges?.push) {
                await nonSerializableStore.options.fsChanges.push(changesUrl, encodedChanges);
                savedInIndexedDb = false;
            } else if (nonSerializableStore.options.fsChanges?.local !== false) {
                await putChanges(changesUrl, encodedChanges);
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
                    message: t("warn_save_locally"),
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
