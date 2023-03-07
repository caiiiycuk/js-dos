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
import { i18nSlice } from "./i18n";

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

export type DosTheme = "light" | "dark" | "cupcake" | "bumblebee" | "emerald" | "corporate" |
    "synthwave" | "retro" | "cyberpunk" | "valentine" | "halloween" | "garden" |
    "forest" | "aqua" | "lofi" | "pastel" | "fantasy" | "wireframe" | "black" |
    "luxury" | "dracula" | "cmyk" | "autumn" | "business" | "acid" | "lemonade" |
    "night" | "coffee" | "winter";

export interface DosOptions {
    pathPrefix?: string,
    theme?: DosTheme,
    lang?: "ru" | "en",
}

export interface DosProps {
    setTheme(theme: DosTheme): void;
    setLang(lang: "ru" | "en"): void;
}

let skipEmulatorsInit = false;
export function Dos(element: HTMLDivElement, options: DosOptions = {}): DosProps {
    if (!skipEmulatorsInit) {
        skipEmulatorsInit = true;
        initEmulators(store, (options.pathPrefix ?? "") + "/emulators/");
    }

    function setTheme(theme: DosTheme) {
        store.dispatch(uiSlice.actions.theme(theme));
    }

    function setLang(lang: "ru" | "en") {
        store.dispatch(i18nSlice.actions.setLang(lang));
    }

    if (options.theme) {
        setTheme(options.theme);
    }

    if (options.lang) {
        setLang(options.lang);
    }

    render(
        <Provider store={store}>
            {<Ui /> as any}
        </Provider>,
        element,
    );

    return {
        setTheme,
        setLang,
    };
}

(window as any).Dos = Dos;
