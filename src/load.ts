import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice } from "./store/dos";
import { nonSerializableStore } from "./non-serializable-store";
import { bundleFromChanges, bundleFromFile, bundleFromUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { store } from "./store";
import { getChangesUrl } from "./cloud/changes";

declare const emulators: Emulators;

export async function loadEmptyBundle(dispatch: Dispatch) {
    await doLoadBundle("empty.jsdos",
        async () => {
            const bundle = await emulators.bundle();
            return bundle.toUint8Array();
        }, null, null, null, dispatch);

    dispatch(uiSlice.actions.frameConf());
}

export async function loadBundle(bundle: Uint8Array, openConfig: boolean, dispatch: Dispatch) {
    await doLoadBundle("bundle.jsdos", () => Promise.resolve(bundle),
        null, null, null, dispatch);
    if (openConfig) {
        dispatch(uiSlice.actions.frameConf());
    }
}

export function loadBundleFromFile(file: File, dispatch: Dispatch) {
    return doLoadBundle(file.name,
        () => bundleFromFile(file, dispatch),
        null, null, null, dispatch);
}


export async function loadBundleFromUrl(url: string, dispatch: Dispatch) {
    const changesUrl = await getChangesUrl(url);
    return doLoadBundle(url,
        () => bundleFromUrl(url, dispatch),
        () => bundleFromChanges(changesUrl),
        url,
        changesUrl,
        dispatch);
}

async function doLoadBundle(bundleName: string,
                            bundleProducer: () => Promise<Uint8Array>,
                            bundleChangesProducer: (() => Promise<Uint8Array | null>) | null,
                            bundleUrl: string | null,
                            bundleChangesUrl: string | null,
                            dispatch: Dispatch) {
    nonSerializableStore.loadedBundle = null;

    dispatch(dosSlice.actions.bndLoad(bundleName));

    const [bundle, bundleChanges] = await Promise.all([bundleProducer(),
        bundleChangesProducer === null ? Promise.resolve(null) : bundleChangesProducer()]);
    dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.bundleConfig(bundle);
    dispatch(editorSlice.actions.init(config));
    if (config === null) {
        dispatch(uiSlice.actions.frameConf());
    }

    // TODO: dosbox.conf parser
    // dispatch(dosSlice.actions.mouseCapture(config?.output.options.autolock.value === true));
    nonSerializableStore.loadedBundle = {
        bundleUrl,
        bundleChangesUrl,
        bundle,
        bundleChanges,
    };
    dispatch(dosSlice.actions.bndReady({}));
}

export async function updateBundleConf() {
    const config = store.getState().editor.bundleConfig;
    const bundle = nonSerializableStore.loadedBundle?.bundle;
    if (bundle === null || config === null) {
        throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
    }

    nonSerializableStore.loadedBundle!.bundle =
        await emulators.bundleUpdateConfig(bundle!, config);
}
