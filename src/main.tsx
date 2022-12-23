import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { Ui } from "./ui";
import { authenticate } from "./auth/auth";
import { store } from "./store";
import { dosSlice, initEmulators } from "./dos";
import { BundleStorage } from "./storage/bundle-storage";
import { loadBundle } from "./load";

export const bundleStorage = new BundleStorage(store);

render(
    <Provider store={store}>
        {<Ui /> as any}
    </Provider>,
    document.getElementById("app") as HTMLElement,
);

let pollStep = "none";

function pollEvents() {
    const state = store.getState();
    const step = state.dos.step;

    if (step === pollStep) {
        return;
    }
    pollStep = step;

    switch (state.dos.step) {
        case "emu-ready": {
            // TODO:
            // / enter url screen
            // / parse params
            const url = "https://cdn.dos.zone/original/2X/6/6a2bfa87c031c2a11ab212758a5d914f7c112eeb.jsdos";

            loadBundle(store, bundleStorage, url)
                .catch((e) => store.dispatch(dosSlice.actions.bndError(e.message)));
        } break;
    };
}

store.subscribe(pollEvents);

authenticate(store);
initEmulators(store);
