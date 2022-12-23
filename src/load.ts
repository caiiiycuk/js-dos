import { Dispatch } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { dosSlice, nonSerializedDosState } from "./dos";
import { loadFile, loadUrl } from "./storage/bundle-storage";

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
    dispatch(dosSlice.actions.bndLoad(bundleName));

    const bundle = await bundleProducer();
    dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.dosConfig(bundle);
    console.log(config);

    nonSerializedDosState.bundle = [bundle];
    dispatch(dosSlice.actions.bndReady({}));
}
