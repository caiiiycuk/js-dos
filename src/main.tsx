import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { Ui } from "./ui";
import { dosSlice } from "./store/dos";
import { store } from "./store";
import { initEmulators } from "./store/dos";
import { loadBundleFromUrl } from "./load";
// eslint-disable-next-line
import { uiSlice } from "./store/ui";
import { i18nSlice } from "./i18n";
import { nonSerializableStore } from "./non-serializable-store";
import { getCachedEmail } from "./store/auth";
import { getCache } from "./host/lcache";

let pollStep = "none";

async function pollEvents() {
    const state = store.getState();
    const step = state.dos.step;

    if (step === pollStep) {
        return;
    }
    pollStep = step;

    switch (state.dos.step) {
        case "emu-ready": {
            const cachedEmail = getCachedEmail();
            if (cachedEmail !== null) {
                nonSerializableStore.cache = await getCache(cachedEmail);
            }

            nonSerializableStore.onEvent("emu-ready");

            // TODO:
            // / enter url screen
            // / parse params

            // store.dispatch(uiSlice.actions.windowSelect());
            // return;

            /* eslint-disable max-len */
            // const url = "https://cdn.dos.zone/original/2X/6/6a2bfa87c031c2a11ab212758a5d914f7c112eeb.jsdos"; // digger
            const url = "https://cdn.dos.zone/custom/dos/doom.jsdos";
            // const url = "https://cdn.dos.zone/original/2X/7/744842062905f72648a4d492ccc2526d039b3702.jsdos"; // sim-city
            // const url = "https://cdn.dos.zone/original/2X/b/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos"; // dhry2
            /* eslint-enable max-len */
            loadBundleFromUrl(url, store.dispatch)
                .catch((e) => store.dispatch(dosSlice.actions.bndError(e.message)));
        } break;
    };
}

store.subscribe(pollEvents);

export interface DosOptions {
    pathPrefix: string,
    theme: "light" | "dark" | "cupcake" | "bumblebee" | "emerald" | "corporate" |
    "synthwave" | "retro" | "cyberpunk" | "valentine" | "halloween" | "garden" |
    "forest" | "aqua" | "lofi" | "pastel" | "fantasy" | "wireframe" | "black" |
    "luxury" | "dracula" | "cmyk" | "autumn" | "business" | "acid" | "lemonade" |
    "night" | "coffee" | "winter",
    lang: "ru" | "en",
    backend: "dosbox" | "dosboxX",
    workerThread: boolean,
    mouseCapture: boolean,
    onEvent: typeof nonSerializableStore.onEvent,
}

export interface DosProps {
    setTheme(theme: DosOptions["theme"]): void;
    setLang(lang: DosOptions["lang"]): void;
    setBackend(lang: DosOptions["backend"]): void;
    setWorkerThread(capture: DosOptions["workerThread"]): void;
    setMouseCapture(capture: DosOptions["mouseCapture"]): void;
}

let skipEmulatorsInit = false;
export function Dos(element: HTMLDivElement, options: Partial<DosOptions> = {}): DosProps {
    setupRootElement(element);

    if (options.onEvent) {
        nonSerializableStore.onEvent = options.onEvent;
    }

    if (!skipEmulatorsInit) {
        skipEmulatorsInit = true;
        initEmulators(store, options.pathPrefix ?? "https://v8.js-dos.com/latest/emulators/");
    }

    function setTheme(theme: DosOptions["theme"]) {
        store.dispatch(uiSlice.actions.theme(theme));
    }

    function setLang(lang: DosOptions["lang"]) {
        store.dispatch(i18nSlice.actions.setLang(lang));
    }

    function setBackend(backend: DosOptions["backend"]) {
        store.dispatch(dosSlice.actions.dosBackend(backend));
    }

    function setWorkerThread(workerThread: DosOptions["workerThread"]) {
        store.dispatch(dosSlice.actions.dosWorker(workerThread));
    }

    function setMouseCapture(capture: DosOptions["mouseCapture"]) {
        store.dispatch(dosSlice.actions.mouseCapture(capture));
    }

    if (options.theme) {
        setTheme(options.theme);
    }

    if (options.lang) {
        setLang(options.lang);
    }

    if (options.backend) {
        setBackend(options.backend);
    }

    if (options.workerThread !== undefined) {
        setWorkerThread(options.workerThread);
    }

    if (options.mouseCapture !== undefined) {
        setMouseCapture(options.mouseCapture);
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
        setBackend,
        setWorkerThread,
        setMouseCapture,
    };
}

function setupRootElement(root: HTMLDivElement) {
    nonSerializableStore.root = root;
    root.classList.add("jsdos-rso");
    root.addEventListener("contextmenu", (e) => {
        e.stopPropagation();
        e.preventDefault();
        return false;
    });
    document.addEventListener("fullscreenchange", () => {
        const fullscreen = document.fullscreenElement === root;
        store.dispatch(uiSlice.actions.setFullScreen(fullscreen));
    });
}

(window as any).Dos = Dos;
