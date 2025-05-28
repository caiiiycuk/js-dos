import { useDispatch, useSelector, useStore } from "react-redux";
import { dosSlice } from "../store/dos";
import { postJsDosEvent, State, useNonSerializableStore } from "../store";
import { useT } from "../i18n";
import { uiSlice } from "../store/ui";
import { Emulators } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { authSlice, loadAccount } from "../store/auth";
import { loadBundleFromUrl } from "../player-api-load";
import { downloadArrayToFs } from "../download-file";
import { idbCache, idbSockdrive } from "../host/idb";
import { uploadFile } from "./file-input";
import { apiSave, canDoCloudSave, traverseSockdriveChanges } from "../player-api";
import { presignDelete } from "../v8/config";

declare const emulators: Emulators;

export function PreRunWindow() {
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);

    return <div class="pre-run-window">
        <Play />
        <PersonalFrame />
        <span class="mt-4 bottom-3 text-ellipsis overflow-hidden text-sm text-neutral/80">
            js-{JSDOS_VERSION}/emu-{emuVersion.substring(0, emuVersion.indexOf(" "))}
        </span>
    </div>;
}

function Changes() {
    const t = useT();
    const nonSerializableStore = useNonSerializableStore();
    const [busy, setBusy] = useState(false);
    const bundleUrl = nonSerializableStore.loadedBundle?.bundleUrl;
    const changesUrl = nonSerializableStore.loadedBundle?.bundleChangesUrl;
    const sockdriveChanges = nonSerializableStore.loadedBundle?.appliedBundleChanges ?? null;
    const bundleChanges = nonSerializableStore.loadedBundle?.bundleChanges ?? sockdriveChanges;
    const haveChanges = bundleChanges !== null;
    const account = useSelector((state: State) => state.auth.account);
    const store = useStore();
    const dispatch = useDispatch();

    if (bundleUrl === null || changesUrl === null) {
        return null;
    }

    if (busy) {
        return <span class="loading loading-spinner loading-md"></span>;
    }

    const icon = <svg xmlns="http://www.w3.org/2000/svg"
        style="padding: 2px"
        viewBox="0 0 16 16" enable-background="new 0 0 16 16"
        fill="currentColor" class="w-4 h-4 ">
        <path fill-rule="evenodd" clip-rule="evenodd"
            d="M15.71,2.29l-2-2C13.53,0.11,13.28,0,13,0h-1v6H4V0H1C0.45,0,0,0.45,0,1v14
                c0,0.55,0.45,1,1,1h14c0.55,0,1-0.45,1-1V3C16,2.72,15.89,2.47,15.71,2.29z
                M14,15H2V9c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1V15
                z M11,1H9v4h2V1z"/>
    </svg>;

    if (haveChanges) {
        return <div class="flex flex-row items-baseline gap-1">
            <p class="text-accent">{t("changes_loaded")}</p>
            <button class="btn btn-ghost btn-xs text-accent underline self-center" onClick={() => {
                downloadArrayToFs("changes.bin",
                    bundleChanges,
                    "application/octet-stream");
            }}>
                {icon}
                {t("download")}
            </button>
            <button class="btn btn-ghost btn-xs underline -ml-2" onClick={() => {
                if (window.confirm(t("delete_changes_confirm"))) {
                    setBusy(true);
                    idbCache().then(async (cache) => {
                        await cache.del(changesUrl!);
                        if (sockdriveChanges !== null) {
                            await traverseSockdriveChanges(sockdriveChanges, async (url, _persist) => {
                                const db = await idbSockdrive(url);
                                await db.del(0 as any);
                                db.close();
                            });
                        }
                        if (canDoCloudSave(account, null) && changesUrl) {
                            await fetch(presignDelete + "?bundleUrl=" + encodeURIComponent(changesUrl));
                        }
                        await loadBundleFromUrl(bundleUrl!, store);
                    })
                        .catch((e) => {
                            console.error(e);
                            dispatch(uiSlice.actions.showToast({
                                message: t("error_deleting_changes"),
                                intent: "error",
                            }));
                        })
                        .finally(() => setBusy(false));
                }
            }}>
                {t("delete")}
            </button>
        </div>;
    }

    async function onUploadChanges(fileInput: HTMLInputElement) {
        try {
            if (fileInput.files === null || fileInput.files.length === 0) {
                return;
            }

            const file = fileInput.files[0];
            await apiSave(store.getState() as State,
                nonSerializableStore, dispatch, false,
                new Uint8Array(await file.arrayBuffer()));
            await loadBundleFromUrl(bundleUrl!, store);
        } catch (e: any) {
            console.error(e);
            dispatch(uiSlice.actions.showToast({
                message: t("error_uploading_changes"),
                intent: "error",
            }));
        } finally {
            setBusy(false);
        }
    }

    return <div class="flex flex-row items-baseline gap-1">
        {t("no_changes_loaded")}
        <button class="btn btn-ghost btn-xs text-accent underline self-center" onClick={() => {
            setBusy(true);
            uploadFile(onUploadChanges);
        }}>
            {icon}
            {t("upload")}
        </button>
    </div>;
}

let knownToken = "-----";
function PersonalFrame() {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const noCloud = useSelector((state: State) => state.ui.noCloud);
    const [token, stateSetToken] = useState<string>(account?.token ?? "");
    const premium = (account?.premium ?? false);
    const nonSerializableStore = useNonSerializableStore();
    const warnOnKey = useSelector((state: State) => state.ui.warnOnKey);
    const warnOnPremium = useSelector((state: State) => state.ui.warnOnPremium);
    const dispatch = useDispatch();
    const store = useStore();

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
                    if (account !== null && nonSerializableStore.options.url) {
                        loadBundleFromUrl(nonSerializableStore.options.url, store).catch((e) => {
                            store.dispatch(dosSlice.actions.bndError(e.message));
                        });
                    } else if (account === null && token.length === 5) {
                        stateSetToken("");
                    }
                }
            }).catch(console.error);
    }

    useEffect(() => {
        loadAccount(token).then(({ token, account }) => {
            dispatch(authSlice.actions.setAccount(account));
        });
    }, []);

    function fireOpenKey() {
        dispatch(uiSlice.actions.autoStart(false));
        postJsDosEvent(nonSerializableStore, "open-key");
    }

    const dzMark = account?.email === "dz.caiiiycuk@gmail.com";
    return <div class="bg-base-200/80 mx-4 my-5 px-8 py-4 flex flex-col gap-2 items-center rounded-xl">
        <div class="mt-4 flex flex-col items-center gap-2">
            {account === null && t("hello_guest")}
            {account !== null && <div class={dzMark ? "bg-warning px-2" : ""}>
                {t("hello") + ", " + (dzMark ? "DOS Zone" : (account.name ?? account.email)) + "!"}
                <span class="link link-neutral lowercase inline ml-1"
                    onClick={() => {
                        setToken("");
                        dispatch(uiSlice.actions.autoStart(false));
                    }}>({t("logout")})</span>
            </div>}
            <Changes />
            {!noCloud && <>
                <div class="mt-2">
                    {account === null && <>
                        {t("no_cloud_access")}
                        <a href="https://v8.js-dos.com/key"
                            onClick={fireOpenKey}
                            target="_blank" class="link link-warning ml-1">{t("key")}</a>
                        &nbsp;{t("no_cloud_access2")}.
                    </>}
                </div>
                {premium === false && <>
                    <span class="text-xs">
                        {t("no_cloud_access3")}
                        {account !== null && <a href="https://v8.js-dos.com/key"
                            onClick={fireOpenKey}
                            target="_blank" class={"link ml-1 lowercase " +
                                (warnOnPremium ? "" : "link-warning")} >({t("fix")})</a>}
                    </span>
                </>}
                {account === null &&
                    <div class="-ml-4">
                        <input maxLength={5} value={token} onChange={(e) => setToken(e.currentTarget.value)}
                            placeholder="-----"
                            class={"input input-bordered mt-4 mb-4 text-center w-24 bg-blend-multiply bg-opacity-40" +
                                (warnOnKey ? " input-warning " : "")}
                            onClick={() => dispatch(uiSlice.actions.autoStart(false))}></input>
                    </div>}
            </>}
        </div>
    </div>;
}

export function Play(props: { class?: string, button?: boolean }) {
    const configChanged = useSelector((state: State) => state.editor.configChanged);
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const frameVisible = useSelector((state: State) => state.ui.frame !== "none");
    const countDownStart = useSelector((state: State) => state.ui.countDownStart);
    const uiAutoStart = useSelector((state: State) => state.ui.autoStart);
    const editor = useSelector((state: State) => state.ui.editor);
    const [countDownRest, setCountDownRest] = useState<number>(countDownStart);
    const [_autoStart, setAutoStart] = useState<boolean>(uiAutoStart);
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();
    const t = useT();
    const autoStart = _autoStart && !frameVisible && !editor;

    useEffect(() => {
        if (countDownStart > 0 && countDownRest > 0 && autoStart) {
            const timeout = setTimeout(() => {
                setCountDownRest(countDownRest - 1);
            }, 1000);
            return () => clearInterval(timeout);
        }

        if (countDownRest === 0 && countDownStart > 0 && autoStart) {
            dispatch(dosSlice.actions.bndPlay({}));
        }
    }, [countDownRest, countDownStart, autoStart]);

    useEffect(() => {
        setAutoStart(uiAutoStart);
    }, [uiAutoStart]);

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
            "min-h-48 max-w-96 max-h-96"}>
            <div class="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-full h-full play-button"
                    onClick={onPlay}>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                    .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                </svg>

                {countDownStart > 0 && autoStart &&
                    <div class="absolute top-0 right-0 translate-x-1/2
                        w-12 h-12 opacity-90 cursor-pointer flex items-center justify-center
                        text-2xl font-bold bg-primary text-primary-content rounded-full
                        animate-pulse cound-down-start" onClick={() => setAutoStart(false)}>
                        <div>{countDownRest}</div>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="size-12">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                    </div>
                }
            </div>

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
