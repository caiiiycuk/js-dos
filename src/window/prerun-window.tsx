import { useDispatch, useSelector } from "react-redux";
import { dosSlice } from "../store/dos";
import { postJsDosEvent, State, useNonSerializableStore } from "../store";
import { useT } from "../i18n";
import { uiSlice } from "../store/ui";
import { Emulators } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { authSlice, loadAccount } from "../store/auth";
import { isSockdrivePremium } from "../player-api";
import { sockdriveBackend } from "../store/init";

declare const emulators: Emulators;

export function PreRunWindow() {
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);

    return <div class="pre-run-window">
        <Play />
        <SecretKey />
        <div class="self-end mt-8 absolute bottom-3">
            <span class="text-ellipsis overflow-hidden">
                js-{JSDOS_VERSION}/emu-{emuVersion.substring(0, emuVersion.indexOf(" "))}
            </span>
        </div>
    </div>;
}

let knownToken = "-----";

function SecretKey() {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const [token, stateSetToken] = useState<string>(account?.token ?? "");
    const { sockdriveEndpoint } = useSelector((state: State) =>
        sockdriveBackend[state.init.sockdriveBackendName] ??
        sockdriveBackend["js-dos"]);
    const [sockdrivePremium, setSockdrivePremium] = useState<boolean>(true);
    const premium = (account?.premium ?? false) || sockdrivePremium;
    const nonSerializableStore = useNonSerializableStore();
    const warnOnKey = useSelector((state: State) => state.ui.warnOnKey);
    const warnOnPremium = useSelector((state: State) => state.ui.warnOnPremium);
    const dispatch = useDispatch();

    useEffect(() => {
        isSockdrivePremium(sockdriveEndpoint, account)
            .then(setSockdrivePremium);
    }, [account?.token, sockdriveEndpoint]);

    if (kiosk) {
        return null;
    }

    function setToken(token: string) {
        if (token === knownToken) {
            return;
        }

        dispatch(uiSlice.actions.warnOnKey(false));
        dispatch(uiSlice.actions.warnOnPremium(false));

        knownToken = token;
        stateSetToken(token);
        loadAccount(token)
            .then(({ token, account }) => {
                if (token === knownToken) {
                    dispatch(authSlice.actions.setAccount(account));
                }
            }).catch(console.error);
    }

    useEffect(() => {
        loadAccount(token).then(({ token, account }) => {
            dispatch(authSlice.actions.setAccount(account));
        });
    }, []);

    function fireOpenKey() {
        postJsDosEvent(nonSerializableStore, "open-key");
    }

    const dzMark = account?.email === "dz.caiiiycuk@gmail.com";
    const warnMark = <svg xmlns="http://www.w3.org/2000/svg" fill="none"
        viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 inline mr-2 text-warning opacity-50">
        <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73
             0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
             0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>;

    return <div class="mt-4 flex flex-col items-center">
        {account === null && t("hello_guest")}
        {account !== null && <div class={dzMark ? "bg-warning px-2" : ""}>
            {t("hello") + ", " + (dzMark ? "DOS Zone" : (account.name ?? account.email)) + "!"}
            <span class="link link-neutral lowercase inline ml-1"
                onClick={() => setToken("")}>({t("logout")})</span>
        </div>}
        <div class="mt-2">
            {account === null && <>
                {t("no_cloud_access")}
                <a href="https://v8.js-dos.com/key"
                    onClick={fireOpenKey}
                    target="_blank" class="link link-neutral ml-1">{t("key")}</a>
                &nbsp;{t("no_cloud_access2")}.
            </>}
            {account !== null && premium === false && <>
                {warnMark}
                <span class={(warnOnPremium ? "text-warning font-bold" : "")}>
                    {t("read_only_access")}
                    <a href="https://v8.js-dos.com/key"
                        onClick={fireOpenKey}
                        target="_blank" class={"link ml-1 lowercase " +
                            (warnOnPremium ? "" : "link-neutral")} >({t("fix")})</a>
                </span>
            </>}
        </div>
        {account === null &&
            <div class="-ml-4">
                {warnMark}
                <input maxLength={5} value={token} onChange={(e) => setToken(e.currentTarget.value)}
                    placeholder="-----"
                    class={"input input-xs input-bordered mt-4 mb-4 text-center w-20" +
                        (warnOnKey ? " input-warning animate-pulse" : "")}></input>
            </div>}
    </div>;
}

export function Play(props: { class?: string, button?: boolean }) {
    const configChanged = useSelector((state: State) => state.editor.configChanged);
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const frameVisible = useSelector((state: State) => state.ui.frame !== "none");
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();
    const t = useT();

    async function onPlay() {
        if (configChanged) {
            const config = bundleConfig;
            const bundle = nonSerializableStore.loadedBundle?.bundle;
            if (bundle === null || config === null || !ArrayBuffer.isView(bundle)) {
                throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
            }

            try {
                nonSerializableStore.loadedBundle!.bundle =
                    await emulators.bundleUpdateConfig(bundle, config);
                dispatch(dosSlice.actions.bndPlay({}));
            } catch (e) {
                dispatch(dosSlice.actions.bndError((e as Error).message ?? "unexpected error"));
            }
        } else {
            dispatch(dosSlice.actions.bndPlay({}));
        }
    }

    if (props.button === true) {
        return <div class="btn btn-accent w-full sm:hidden" onClick={onPlay}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>

            {t("play")}
        </div>;
    } else {
        return <div class={props.class + " relative cursor-pointer w-1/4 h-1/4 min-w-48 " +
            "min-h-48 max-w-96 max-h-96"} onClick={onPlay}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-full h-full play-button">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class={"w-10 h-10 absolute right-0 bottom-0 cursor-pointer" +
                    (frameVisible ? " sidebar-highlight" : "")}
                onClick={(e) => {
                    if (frameVisible) {
                        dispatch(uiSlice.actions.frameNone());
                    } else {
                        dispatch(uiSlice.actions.framePreRun());
                    }
                    e.stopPropagation();
                }}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55
                        0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257
                        1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26
                        1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010
                        .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298
                        2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0
                        01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55
                        0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0
                        01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0
                        01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932
                        6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0
                        01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072
                        1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>;
    }
}
