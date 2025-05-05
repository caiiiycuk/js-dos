import { Dispatch, Store } from "@reduxjs/toolkit";
import { DosConfig, Emulators, InitFs } from "emulators";
import { dosSlice } from "./store/dos";
import { changesFromUrl, bundleFromFile, bundleFromUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { getChangesUrl } from "./v8/changes";
import { storageSlice } from "./store/storage";
import { getNonSerializableStore, getState } from "./store";
import { applySockdriveChanges } from "./player-api";

declare const emulators: Emulators;


export async function loadEmptyBundle(store: Store) {
    await doLoadBundle("empty.jsdos",
        (async () => {
            const bundle = await emulators.bundle();
            return bundle.toUint8Array();
        })(), null, null, store);

    store.dispatch(uiSlice.actions.frameConf());
    store.dispatch(uiSlice.actions.setEditor(true));
}

export async function loadBundle(bundle: Uint8Array, openConfig: boolean, store: Store) {
    await doLoadBundle("bundle.jsdos", Promise.resolve(bundle),
        null, null, store);
    if (openConfig) {
        store.dispatch(uiSlice.actions.frameConf());
    }
}

export function loadBundleFromFile(file: File, store: Store) {
    return doLoadBundle(file.name,
        bundleFromFile(file, store),
        null, null, store);
}

export async function loadBundleFromConfg(config: DosConfig, initFs: InitFs | null, store: Store) {
    const nonSerializableStore = getNonSerializableStore(store);
    const dispatch = store.dispatch;
    nonSerializableStore.loadedBundle = null;

    dispatch(editorSlice.actions.init(config));
    syncWithConfig(config, dispatch);

    nonSerializableStore.loadedBundle = {
        bundleUrl: null,
        bundleChangesUrl: null,
        bundle: config,
        bundleChanges: null,
        appliedBundleChanges: null,
        initFs,
    };
    dispatch(dosSlice.actions.bndReady({}));
}

export async function loadBundleFromUrl(url: string, store: Store) {
    return doLoadBundle(url,
        bundleFromUrl(url, store),
        changesProducer(url, store),
        url,
        store);
}

async function doLoadBundle(bundleName: string,
                            bundlePromise: Promise<Uint8Array>,
                            bundleChangesPromise: (ReturnType<typeof changesProducer>) | null,
                            bundleUrl: string | null,
                            store: Store) {
    const nonSerializableStore = getNonSerializableStore(store);
    const dispatch = store.dispatch;
    nonSerializableStore.loadedBundle = null;


    dispatch(dosSlice.actions.bndLoad(bundleName));

    const bundle = await bundlePromise;
    dispatch(storageSlice.actions.ready());
    const bundleChanges = await bundleChangesPromise;
    dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.bundleConfig(bundle);
    dispatch(editorSlice.actions.init(config));
    if (config === null) {
        dispatch(uiSlice.actions.frameConf());
    } else {
        syncWithConfig(config, dispatch);
    }

    nonSerializableStore.loadedBundle = {
        bundleUrl,
        bundleChangesUrl: bundleChanges?.url ?? null,
        bundle,
        bundleChanges: bundleChanges?.bundle ?? null,
        appliedBundleChanges: bundleChanges?.appliedBundleChanges ?? null,
        initFs: null,
    };
    dispatch(dosSlice.actions.bndReady({}));
}

async function changesProducer(bundleUrl: string, store: Store): Promise<{
    url: string,
    bundle: Uint8Array | null,
    appliedBundleChanges: Uint8Array | null,
}> {
    const account = getState(store).auth.account;
    const owner = account?.email ?? "guest";
    const url = getChangesUrl(owner, bundleUrl);
    const changes = await changesFromUrl(url, account, store);

    if (changes !== null && changes.length > 1 &&
        !(changes[0] === 0x50 && changes[1] === 0x4b)) {
        if (!(await applySockdriveChanges(changes))) {
            store.dispatch(uiSlice.actions.showToast({
                message: "Changes is not a zip file",
                intent: "error",
            }));
        }

        return {
            url,
            bundle: null,
            appliedBundleChanges: changes,
        };
    }

    return {
        url,
        bundle: changes,
        appliedBundleChanges: null,
    };
}

function syncWithConfig(config: DosConfig, dispatch: Dispatch) {
    applySockdriveOptionsIfNeeded(config.dosboxConf, dispatch);
    dispatch(dosSlice.actions.mouseCapture(config.dosboxConf.indexOf("autolock=true") >= 0));
}

export function applySockdriveOptionsIfNeeded(config: string, dispatch: Dispatch) {
    if (config.indexOf("sockdrive") >= 0 || config.indexOf(".qcow2") >= 0) {
        dispatch(dosSlice.actions.dosBackendLocked(true));
        dispatch(dosSlice.actions.dosBackend("dosboxX"));
        dispatch(dosSlice.actions.noCursor(true));
        dispatch(uiSlice.actions.canSave(config.indexOf(".qcow2") === -1));
    }
}
