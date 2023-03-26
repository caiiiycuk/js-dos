import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice } from "./store/dos";
import { nonSerializableStore } from "./non-serializable-store";
import { loadFile, loadUrl } from "./host/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { store } from "./store";

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
        () => loadFile(file, dispatch),
        null, null, null, dispatch);
}


export function loadBundleFromUrl(url: string, dispatch: Dispatch) {
    return doLoadBundle(url,
        () => loadUrl(url, dispatch),
        null, null, null, dispatch);
}

async function doLoadBundle(bundleName: string,
                            bundleProducer: () => Promise<Uint8Array>,
                            bundleUrl: string | null,
                            bundleChangesUrl: string | null,
                            bundleChangesProducer: (() => Promise<Uint8Array>) | null,
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
