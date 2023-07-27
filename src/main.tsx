import { render } from "preact";
import "./index.css";

import { Provider } from "react-redux";
import { Ui } from "./ui";
import { dosSlice } from "./store/dos";
import { store } from "./store";
import { initEmulators } from "./store/dos";
// eslint-disable-next-line
import { uiSlice } from "./store/ui";
import { i18nSlice } from "./i18n";
import { nonSerializableStore, postJsDosEvent } from "./non-serializable-store";
import { getCachedEmail } from "./store/auth";
import { getCache } from "./host/lcache";
import { loadBundleFromUrl } from "./load";

import { DosOptions, DosProps, DosFn } from "./public/types";

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
            nonSerializableStore.cache = await getCache(cachedEmail ?? "guest");

            if (nonSerializableStore.options.url) {
                loadBundleFromUrl(nonSerializableStore.options.url, store.dispatch)
                    .catch((e) => store.dispatch(dosSlice.actions.bndError(e.message)));
            } else {
                store.dispatch(uiSlice.actions.windowSelect());
            }

            postJsDosEvent("emu-ready");
        } break;
    };
}

store.subscribe(pollEvents);


let skipEmulatorsInit = false;
export const Dos: DosFn = (element: HTMLDivElement,
    options: Partial<DosOptions> = {}): DosProps =>{
    nonSerializableStore.options = options;
    setupRootElement(element);

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

    function setServer(server: DosOptions["server"]) {
        store.dispatch(dosSlice.actions.setServer(server));
    }

    function setRoom(room: DosOptions["room"]) {
        store.dispatch(dosSlice.actions.setRoom(room));
    }

    function setFrame(frame: "network") {
        store.dispatch(uiSlice.actions.frameNetwork());
    }

    function setBackground(background: string) {
        store.dispatch(uiSlice.actions.background(background));
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

    if (options.server) {
        setServer(options.server);
    }

    if (options.room) {
        setRoom(options.room);
    }

    if (options.background) {
        setBackground(options.background);
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
        setServer,
        setRoom,
        setFrame,
        setBackground,
    };
};

function setupRootElement(root: HTMLDivElement) {
    nonSerializableStore.root = root;
    root.classList.add("jsdos-rso");
    root.addEventListener("contextmenu", (e) => {
        if (e.target !== null &&
            (e.target as HTMLElement).classList?.contains("contextmenu")) {
            return;
        }
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
