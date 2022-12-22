import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { Ui } from "./ui";
import { authenticate } from "./auth/auth";
import { store } from "./store";
import { dosSlice, initEmulators } from "./dos";
import { BundleStorage } from "./storage/bundle-storage";

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
            const url = "http://localhost:8080/test/digger.jsdos";

            store.dispatch(dosSlice.actions.bndLoad(url));
            bundleStorage
                .load(url)
                .then(() => {
                    // store.dispatch(dosSlice.actions.bndReady());
                })
                .catch((e) => {
                    // jj
                });
        } break;
    };
}

store.subscribe(pollEvents);

authenticate(store);
initEmulators(store);
