import { Dispatch, Store } from "@reduxjs/toolkit";
import { DosConfig, Emulators, InitFs } from "emulators";
import { dosSlice } from "./store/dos";
import { bundleFromChanges, bundleFromFile, bundleFromUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { getChangesUrl } from "./v8/changes";
import { storageSlice } from "./store/storage";
import { getNonSerializableStore, getState } from "./store";

declare const emulators: Emulators;

export const sockdriveImgmount = new RegExp(
    "imgmount\\s+(\\d+)\\s+sockdrive\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s*$", "gm");

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
        initFs: null,
    };
    dispatch(dosSlice.actions.bndReady({}));
}

async function changesProducer(bundleUrl: string, store: Store): Promise<{
    url: string,
    bundle: Uint8Array | null,
}> {
    const account = getState(store).auth.account;
    const owner = account?.email ?? "guest";
    const url = getChangesUrl(owner, bundleUrl);
    const bundle = await bundleFromChanges(url, account, store);
    return {
        url,
        bundle,
    };
}

function syncWithConfig(config: DosConfig, dispatch: Dispatch) {
    applySockdriveOptionsIfNeeded(config.dosboxConf, dispatch);
    dispatch(dosSlice.actions.mouseCapture(config.dosboxConf.indexOf("autolock=true") >= 0));
}

export function applySockdriveOptionsIfNeeded(config: string, dispatch: Dispatch) {
    if (config.indexOf("sockdrive") >= 0) {
        dispatch(dosSlice.actions.dosBackendLocked(true));
        dispatch(dosSlice.actions.dosBackend("dosboxX"));
        dispatch(dosSlice.actions.noCursor(true));
    }
}
