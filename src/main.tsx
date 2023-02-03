import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { Ui } from "./ui";
import { dosSlice } from "./store/dos";
import { authenticate } from "./auth/auth";
import { store } from "./store";
import { initEmulators } from "./store/dos";
import { loadBundleFromUrl } from "./load";
// eslint-disable-next-line
import { uiSlice } from "./store/ui";

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

            store.dispatch(uiSlice.actions.windowUpload());
            return;

            /* eslint-disable max-len */
            // const url = "https://cdn.dos.zone/original/2X/6/6a2bfa87c031c2a11ab212758a5d914f7c112eeb.jsdos"; // digger
            // const url = "https://cdn.dos.zone/custom/dos/doom.jsdos";
            // const url = "https://cdn.dos.zone/original/2X/7/744842062905f72648a4d492ccc2526d039b3702.jsdos"; // sim-city
            const url = "https://cdn.dos.zone/original/2X/b/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos"; // dhry2
            /* eslint-enable max-len */
            loadBundleFromUrl(url, store.dispatch)
                .catch((e) => store.dispatch(dosSlice.actions.bndError(e.message)));
        } break;
    };
}

store.subscribe(pollEvents);

authenticate(store);
initEmulators(store);
