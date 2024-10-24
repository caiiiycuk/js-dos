import { useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { uiSlice } from "./store/ui";
import { Window } from "./window/window";
import { useT } from "./i18n";

let currentWideScreen = uiSlice.getInitialState().wideScreen;
export function Ui() {
    const rootRef = useRef<HTMLDivElement>(null);
    const hidden = useSelector((state: State) => state.ui.hidden);
    const theme = useSelector((state: State) => state.ui.theme);
    const dispatch = useDispatch();

    useEffect(() => {
        if (hidden || rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current;
        function onResize() {
            const size = root.getBoundingClientRect().width;
            const wide = size > 640;
            if (wide !== currentWideScreen) {
                currentWideScreen = wide;
                dispatch(uiSlice.actions.setWideScreen(currentWideScreen));
            }
        }

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(root);
        window.addEventListener("resize", onResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, [hidden, rootRef, dispatch]);

    if (hidden) {
        return null;
    }

    return <div
        ref={rootRef}
        class="w-full h-full relative"
        data-theme={theme}>
        <Window />
        <Frame />
        <SideBar />
        <Toast />
        <UpdateWsWarning />
    </div>;
};

function Toast() {
    const toast = useSelector((state: State) => state.ui.toast);
    const intent = useSelector((state: State) => state.ui.toastIntent);
    const intentClass = intent === "panic" ? "error" : intent;

    if (toast === null) {
        return null;
    }

    let path = <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>;

    if (intent === "warning") {
        path = <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374
                    1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697
                    16.126ZM12 15.75h.007v.008H12v-.008Z" />;
    }

    if (intent === "error" || intent === "panic") {
        path = <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />;
    }

    return <div class="absolute right-10 bottom-10">
        <div class={ "alert alert-" + intentClass + " text-" + intentClass + "-content" }>
            <svg xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                class="shrink-0 w-6 h-6">
                {path}
            </svg>
            <span class="break-words">{toast}</span>
        </div>
    </div>;
}

function UpdateWsWarning() {
    const updateWsWarning = useSelector((state: State) => state.ui.updateWsWarning);
    const t = useT();
    const dispatch = useDispatch();

    if (!updateWsWarning) {
        return null;
    }

    function fix() {
        window.open("https://dos.zone/download/", "_blank");
        dispatch(uiSlice.actions.updateWsWarning(false));
    }

    function close() {
        dispatch(uiSlice.actions.updateWsWarning(false));
    }

    return <div class="absolute left-20 right-10 top-10 flex justify-center">
        <div class="alert w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="size-6 text-error">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217
                    3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                    0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span>{t("ws_outdated")}</span>
            <div>
                <button class="btn btn-sm btn-primary mr-2" onClick={fix}>{t("update")}</button>
                <button class="btn btn-sm" onClick={close}>{t("close")}</button>
            </div>
        </div>
    </div>;
}
