import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice, nonSerializedDosState } from "./store/dos";
import { loadFile, loadUrl } from "./storage/bundle-storage";
import { explorerExtract, newEditor } from "./frame/editor/editor-explorer";
import { uiSlice } from "./store/ui";
import { editorSlice } from "./store/editor";

declare const emulators: Emulators;

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
    nonSerializedDosState.editorBundle = null;

    dispatch(dosSlice.actions.bndLoad(bundleName));

    const bundle = await bundleProducer();
    dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.dosConfig(bundle);
    newEditor(bundle, dispatch);

    if (config === null) {
        await explorerExtract(dispatch);
        dispatch(uiSlice.actions.frameConf());
    } else {
        dispatch(editorSlice.actions.dosboxConf(JSON.stringify(config, null, 2)));
    }

    dispatch(dosSlice.actions.mouseLock(config?.output.options.autolock.value === true));
    nonSerializedDosState.bundle = [bundle];
    dispatch(dosSlice.actions.bndReady({}));
}

export async function makeBundle(bundle: Uint8Array | null,
                                 dosboxConf: string) {
    if (bundle === null) {
        throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
    }
}
