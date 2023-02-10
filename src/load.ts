import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice, nonSerializedDosState } from "./store/dos";
import { loadFile, loadUrl } from "./storage/bundle-storage";
import { newEditor } from "./window/editor/editor-explorer";

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
    if (config === null) {
        newEditor(bundle, dispatch);
        return;
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
