import { useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Login } from "./login/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { dispatchLoginAction, uiSlice } from "./store/ui";
import { Window } from "./window/window";
import { useT } from "./i18n";

let currentWideScreen = uiSlice.getInitialState().wideScreen;
export function Ui() {
    const rootRef = useRef<HTMLDivElement>(null);
    const theme = useSelector((state: State) => state.ui.theme);
    const dispatch = useDispatch();

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
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
    }, [rootRef, dispatch]);

    return <div
        ref={rootRef}
        class="w-full h-full relative"
        data-theme={theme}>
        <Window />
        <Frame />
        <SideBar />
        <Login />
        <Toast />
        <ReadOnlyWarning />
    </div>;
};

function Toast() {
    const toast = useSelector((state: State) => state.ui.toast);
    const intent = useSelector((state: State) => state.ui.toastIntent);

    if (toast === null) {
        return null;
    }

    return <div class="absolute right-10 bottom-10">
        <div class={"alert alert-" + (intent === "panic" ? "error" : intent)} >
            {toast}
        </div>
    </div>;
}

function ReadOnlyWarning() {
    const readOnlyWarning = useSelector((state: State) => state.ui.readOnlyWarning);
    const account = useSelector((state: State) => state.auth.account);
    const t = useT();
    const dispatch = useDispatch();

    if (!readOnlyWarning) {
        return null;
    }

    function fix() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
        dispatchLoginAction(account, dispatch);
    }

    function close() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
    }

    return <div class="absolute right-10 bottom-10">
        <div class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>{t("read_only_access")}</span>
            <div>
                <button class="btn btn-sm btn-primary mr-2" onClick={fix}>{t("fix")}</button>
                <button class="btn btn-sm" onClick={close}>{t("close")}</button>
            </div>
        </div>
    </div>;
}
