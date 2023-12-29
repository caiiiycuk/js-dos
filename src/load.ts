import { Dispatch, Unsubscribe } from "@reduxjs/toolkit";
import { DosConfig, Emulators } from "emulators";
import { dosSlice } from "./store/dos";
import { nonSerializableStore } from "./non-serializable-store";
import { bundleFromChanges, bundleFromFile, bundleFromUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { store } from "./store";
import { getChangesUrl } from "./v8/changes";
import { storageSlice } from "./store/storage";

declare const emulators: Emulators;

export async function loadEmptyBundle(dispatch: Dispatch) {
    await doLoadBundle("empty.jsdos",
        (async () => {
            const bundle = await emulators.bundle();
            return bundle.toUint8Array();
        })(), null, null, dispatch);

    dispatch(uiSlice.actions.frameConf());
    dispatch(uiSlice.actions.setEditor(true));
}

export async function loadBundle(bundle: Uint8Array, openConfig: boolean, dispatch: Dispatch) {
    await doLoadBundle("bundle.jsdos", Promise.resolve(bundle),
        null, null, dispatch);
    if (openConfig) {
        dispatch(uiSlice.actions.frameConf());
    }
}

export function loadBundleFromFile(file: File, dispatch: Dispatch) {
    return doLoadBundle(file.name,
        bundleFromFile(file, dispatch),
        null, null, dispatch);
}

export async function loadBundleFromConfg(config: DosConfig, dispatch: Dispatch) {
    nonSerializableStore.loadedBundle = null;

    dispatch(editorSlice.actions.init(config));
    syncWithConfig(config, dispatch);

    nonSerializableStore.loadedBundle = {
        bundleUrl: null,
        bundleChangesUrl: null,
        bundle: config,
        bundleChanges: null,
    };
    dispatch(dosSlice.actions.bndReady({}));
}

export async function loadBundleFromUrl(url: string, dispatch: Dispatch) {
    const owner = store.getState().auth.account?.email ?? "guest";
    const changesUrl = await getChangesUrl(owner, url);
    return doLoadBundle(url,
        bundleFromUrl(url, dispatch),
        changesProducer(changesUrl),
        url,
        dispatch);
}

async function doLoadBundle(bundleName: string,
                            bundlePromise: Promise<Uint8Array>,
                            bundleChangesPromise: (ReturnType<typeof changesProducer>) | null,
                            bundleUrl: string | null,
                            dispatch: Dispatch) {
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
    };
    dispatch(dosSlice.actions.bndReady({}));
}

async function changesProducer(bundleUrl: string): Promise<{
    url: string,
    bundle: Uint8Array | null,
}> {
    if (!store.getState().auth.ready) {
        await new Promise<void>((resolve) => {
            let unsubscirbe: Unsubscribe | null = null;
            const updateFn = () => {
                if (store.getState().auth.ready) {
                    unsubscirbe!();
                    resolve();
                }
            };
            unsubscirbe = store.subscribe(updateFn);
        });
    }

    const account = store.getState().auth.account;
    const owner = account?.email ?? "guest";
    const url = getChangesUrl(owner, bundleUrl);
    const bundle = await bundleFromChanges(url, account);
    return {
        url,
        bundle,
    };
}

export async function updateBundleConf() {
    const config = store.getState().editor.bundleConfig;
    const bundle = nonSerializableStore.loadedBundle?.bundle;
    if (bundle === null || config === null || !ArrayBuffer.isView(bundle)) {
        throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
    }

    nonSerializableStore.loadedBundle!.bundle =
        await emulators.bundleUpdateConfig(bundle, config);
}

function syncWithConfig(config: DosConfig, dispatch: Dispatch) {
    if (config.dosboxConf.indexOf("sockdrive") >= 0) {
        dispatch(dosSlice.actions.dosBackendLocked(true));
        dispatch(dosSlice.actions.dosBackend("dosboxX"));
    }
    dispatch(dosSlice.actions.mouseCapture(config.dosboxConf.indexOf("autolock=true") >= 0));
}
