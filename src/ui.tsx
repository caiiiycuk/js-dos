import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Login } from "./login/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { dispatchLoginAction, uiSlice } from "./store/ui";
import { Window } from "./window/window";
import { useT } from "./i18n";
import { sockdriveBackend } from "./store/init";
import { isSockdrivePremium } from "./player-api";

let currentWideScreen = uiSlice.getInitialState().wideScreen;
export function Ui() {
    const rootRef = useRef<HTMLDivElement>(null);
    const hidden = useSelector((state: State) => state.ui.hidden);
    const theme = useSelector((state: State) => state.ui.theme);
    const dispatch = useDispatch();
    const prerun = useSelector((state: State) => state.ui.window) === "prerun";

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
        <Login />
        <Toast />
        { prerun && <ReadOnlyWarning /> }
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
            <span>{toast}</span>
        </div>
    </div>;
}

function ReadOnlyWarning() {
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const readOnlyWarning = useSelector((state: State) => state.ui.readOnlyWarning);
    const account = useSelector((state: State) => state.auth.account);
    const backend = useSelector((state: State) => state.dos.backend);
    const t = useT();
    const dispatch = useDispatch();
    const { sockdriveEndpoint } = useSelector((state: State) =>
        sockdriveBackend[state.init.sockdriveBackendName] ??
        sockdriveBackend["js-dos"]);
    const [sockdrivePremium, setSockdrivePremium] = useState<boolean>(true);
    const premium = (account?.premium ?? false) || sockdrivePremium;

    useEffect(() => {
        isSockdrivePremium(sockdriveEndpoint, account)
            .then(setSockdrivePremium);
    }, [account?.token, sockdriveEndpoint]);

    if (!readOnlyWarning || kiosk ||
            (account !== null && backend === "dosbox") ||
            premium) {
        return null;
    }

    function close() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
    }

    function fix() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
        if (account === null) {
            dispatchLoginAction(account, dispatch);
        } else {
            window.open("https://js-dos.com/subscription.html", "_blank");
        }
    }

    const text = account === null ?
        <>{t("no_cloud_access")}
            <a href="https://js-dos.com/cloud-storage.html"
                target="_blank" class="link link-primary ml-1">{t("cloud_storage")}</a>
        </> : <>{t("read_only_access")}</>;

    return <div class="absolute pl-16 right-4 bottom-10">
        <div class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                class="text-error shrink-0 w-7 h-7 mt-1" stroke="currentColor" stroke-width="1.5px">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374
                    1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697
                    16.126ZM12 15.75h.007v.008H12v-.008Z" />;
            </svg>
            <span>{text}</span>
            <div>
                <button class="btn btn-sm btn-primary mr-2" onClick={fix}>
                    {account === null ? t("login") : t("fix")}
                </button>
                <button class="btn btn-sm" onClick={close}>{t("close")}</button>
            </div>
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
