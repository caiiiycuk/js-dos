import { Emulators } from "emulators";
import { dosSlice, nonSerializedDosState } from "./dos";
import { BundleStorage } from "./storage/bundle-storage";
import { makeStore } from "./store";

declare const emulators: Emulators;

export async function loadBundle(store: ReturnType<typeof makeStore>,
                                 bundleStorage: BundleStorage,
                                 url: string) {
    store.dispatch(dosSlice.actions.bndLoad(url));

    const bundle = await bundleStorage.load(url);
    store.dispatch(dosSlice.actions.bndConfig());

    const config = await emulators.dosConfig(bundle);
    console.log(config);

    nonSerializedDosState.bundle = [bundle];
    store.dispatch(dosSlice.actions.bndReady({}));
}
