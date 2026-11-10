import { Dispatch, Store } from "@reduxjs/toolkit";
import { DosConfig, Emulators, InitFs } from "emulators";
import { dosSlice } from "./store/dos";
import { changesFromUrl, bundleFromFile, bundleFromUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { storageSlice } from "./store/storage";
import { getNonSerializableStore, LoadedBundle } from "./store";
import { editorOperation } from "./player-editor-queue";

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
    return editorOperation(store, {}, async () => commitBundle(store, {
        bundleUrl: null,
        bundleChangesUrl: null,
        bundle: config,
        bundleChanges: null,
        initFs,
    }, config, "bundle.jsdos"));
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
    return editorOperation(store, {}, async () => {
        const nonSerializableStore = getNonSerializableStore(store);
        const bundle = await bundlePromise;
        const bundleChanges = await bundleChangesPromise;
        const config = await readBundleConfig(bundle);
        if (nonSerializableStore.stopped) {
            return;
        }
        commitBundle(store, {
            bundleUrl,
            bundleChangesUrl: bundleChanges?.url ?? null,
            bundle,
            bundleChanges: bundleChanges?.bundle ?? null,
            initFs: nonSerializableStore.options.initFs ?? null,
        }, config, bundleName);
    });
}

export async function readBundleConfig(bundle: Uint8Array) {
    if (!(bundle instanceof Uint8Array) || bundle.length < 22 || bundle[0] !== 0x50 || bundle[1] !== 0x4b ||
        !((bundle[2] === 3 && bundle[3] === 4) || (bundle[2] === 5 && bundle[3] === 6))) {
        throw new Error("Invalid ZIP bundle");
    }
    return emulators.bundleConfig(bundle);
}

export function commitBundle(store: Store, loaded: LoadedBundle, config: DosConfig | null, name: string) {
    if (getNonSerializableStore(store).stopped) {
        return;
    }
    store.dispatch(dosSlice.actions.bndLoad(name));
    store.dispatch(storageSlice.actions.ready());
    store.dispatch(dosSlice.actions.bndConfig());
    store.dispatch(editorSlice.actions.init(config));
    if (config === null) {
        store.dispatch(uiSlice.actions.frameConf());
    } else {
        syncWithConfig(config, store.dispatch);
    }
    getNonSerializableStore(store).loadedBundle = loaded;
    store.dispatch(dosSlice.actions.bndReady({}));
}

async function changesProducer(bundleUrl: string, store: Store): Promise<{
    url: string,
    bundle: Uint8Array | null,
}> {
    const url = (await getNonSerializableStore(store).options.fsChanges?.urlToKey?.(bundleUrl)) ??
        bundleUrl + ".changes";

    return {
        url,
        bundle: await changesFromUrl(url, store),
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
        dispatch(dosSlice.actions.withSockdrive(true));
        dispatch(uiSlice.actions.canSave(config.indexOf(".qcow2") === -1));
    }
}
