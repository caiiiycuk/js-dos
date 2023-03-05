import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice, nonSerializedDosState } from "./store/dos";
import { loadFile, loadUrl } from "./storage/bundle-storage";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";
import { store } from "./store";

declare const emulators: Emulators;

export async function loadEmptyBundle(dispatch: Dispatch) {
    await doLoadBundle("empty.jsdos", async () => {
        const bundle = await emulators.bundle();
        return bundle.toUint8Array();
    }, dispatch);

    dispatch(uiSlice.actions.frameConf());
}

export async function loadBundle(bundle: Uint8Array, openConfig: boolean, dispatch: Dispatch) {
    doLoadBundle("bundle.jsdos", () => Promise.resolve(bundle), dispatch);
    if (openConfig) {
        dispatch(uiSlice.actions.frameConf());
    }
}

export async function loadBundleFromFile(file: File, dispatch: Dispatch) {
    doLoadBundle(file.name, () => loadFile(file, dispatch), dispatch);
}


export async function loadBundleFromUrl(url: string, dispatch: Dispatch) {
    doLoadBundle(url, () => loadUrl(url, dispatch), dispatch);
}

async function doLoadBundle(bundleName: string,
                            bundleProducer: () => Promise<Uint8Array>,
                            dispatch: Dispatch) {
    nonSerializedDosState.bundle = null;

    dispatch(dosSlice.actions.bndLoad(bundleName));

    const bundle = await bundleProducer();
    dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.bundleConfig(bundle);
    dispatch(editorSlice.actions.init(config));
    if (config === null) {
        dispatch(uiSlice.actions.frameConf());
    }

    // TODO: dosbox.conf parser
    // dispatch(dosSlice.actions.mouseLock(config?.output.options.autolock.value === true));
    nonSerializedDosState.bundle = [bundle];
    dispatch(dosSlice.actions.bndReady({}));
}

export async function updateBundleConf() {
    const config = store.getState().editor.bundleConfig;
    const bundle = nonSerializedDosState.bundle;
    if (bundle === null || config === null) {
        throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
    }

    bundle[0] = await emulators.bundleUpdateConfig(bundle[0], config);
}
