import { Emulators, CommandInterface, InitFs } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector, useStore } from "react-redux";
import { dosSlice } from "../../store/dos";
import { State, useNonSerializableStore, postJsDosEvent, Store } from "../../store";
import { useDosRuntime } from "./dos-runtime";
import { Dhry2Results } from "./dos-dhry2";
import { createWsTransportLayer } from "../../ws/ws-transport-layer";
import { actualWsVersion, isDhry2Bundle } from "../../v8/config";
import { uiSlice } from "../../store/ui";
import { extractLayersConfig } from "../../layers/controls/layers-config";
import { pointer } from "./controls/mouse/pointer";
import { SoftKeyboard } from "../soft-keyboard";
import { useT } from "../../i18n";
import { apiSave } from "../../player-api";

declare const emulators: Emulators;

export function DosWindow(props: {
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);
    const token = useSelector((state: State) => state.auth.account?.token) ?? "";
    const worker = useSelector((state: State) => state.dos.worker);
    const backend = useSelector((state: State) => state.dos.backend);
    const backendHardware = useSelector((state: State) => state.dos.backendHardware);
    const dosNoCursor = useSelector((state: State) => state.dos.noCursor);
    const locked = useSelector((state: State) => state.ui.pointerLocked);
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const dispatch = useDispatch();
    const nonSerializableStore = useNonSerializableStore();
    const cursor = pointer.canLock && mouseCapture && !locked ? "cursor-pointer" :
        dosNoCursor ? "cursor-none" : "";
    const useOffscreenCanvas = useSelector((state: State) => state.dos.offscreenCanvas);
    const sockdrivePreload = useSelector((state: State) => state.dos.sockdrivePreload);

    useEffect(() => {
        try {
            const loadedBundle = nonSerializableStore.loadedBundle!;
            let bundles: InitFs = (loadedBundle.bundleChanges !== null ?
                [loadedBundle.bundle, loadedBundle.bundleChanges] :
                loadedBundle.bundle) as any;

            if (loadedBundle.initFs !== null) {
                if (!Array.isArray(bundles)) {
                    bundles = [bundles];
                }

                if (Array.isArray(loadedBundle.initFs)) {
                    for (const next of loadedBundle.initFs) {
                        bundles.push(next);
                    }
                } else {
                    bundles.push(loadedBundle.initFs);
                }
            }

            loadedBundle.bundle = null;
            loadedBundle.bundleChanges = null;
            loadedBundle.appliedBundleChanges = null;
            loadedBundle.initFs = null;

            const ci: Promise<CommandInterface> = (async () => {
                if (backendHardware && nonSerializableStore.options.backendHardware) {
                    const ws = await nonSerializableStore.options.backendHardware(backend);
                    if (ws !== null) {
                        return emulators.backend(bundles, await createWsTransportLayer(ws, (version) => {
                            if (version < actualWsVersion) {
                                dispatch(uiSlice.actions.updateWsWarning(true));
                            }
                            console.log("wsServer:", version, " expected:", actualWsVersion);
                        }), {
                            token,
                            sockdrivePreload,
                        });
                    }
                };

                if (useOffscreenCanvas && canvasRef.current !== null &&
                    typeof canvasRef.current.transferControlToOffscreen === "function") {
                    nonSerializableStore.offscreenCanvas = canvasRef.current.transferControlToOffscreen();
                }

                return (emulators as any)[((backend !== "dosbox" && backend !== "dosboxX") ? "dosbox" : backend) +
                    (worker ? "Worker" : "Direct")](bundles, {
                    token,
                    canvas: nonSerializableStore.offscreenCanvas,
                    audioWorklet: true,
                    sockdrivePreload,
                });
            })();

            ci
                .then((ci) => {
                    setCi(ci);
                    dispatch(dosSlice.actions.ci(true));
                    if (pointer.mobile) {
                        ci.config()
                            .then((c) => {
                                dispatch(dosSlice.actions.mobileControls(extractLayersConfig(c.jsdosConf) !== null));
                            })
                            .catch((e) => dispatch(dosSlice.actions.emuError(e.message)));
                    }
                    nonSerializableStore.ci = ci;
                    postJsDosEvent(nonSerializableStore, "ci-ready", ci);
                })
                .catch((e) => dispatch(dosSlice.actions.emuError(e.message)));

            return () => {
                ci.then((ci) => {
                    dispatch(dosSlice.actions.ci(false));
                    nonSerializableStore.ci = null;
                    ci.exit();
                });
            };
        } catch (e) {
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    }, [worker, backend, token, useOffscreenCanvas, sockdrivePreload]);

    return <div class="flex flex-col flex-grow h-full overflow-hidden">
        <div class="bg-black h-full flex-grow overflow-hidden relative">
            <canvas class={cursor} ref={canvasRef} />
            {canvasRef.current && ci && <DosRuntime canvas={canvasRef.current} ci={ci} />}
            <ClickToLock />
        </div>
        <SoftKeyboard ci={ci} />
    </div>;
}

function ClickToLock() {
    const locked = useSelector((state: State) => state.ui.pointerLocked);
    const mouseCapture = useSelector((state: State) => state.dos.mouseCapture);
    const mouseSensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    const clickToLockModal = useSelector((state: State) => state.ui.clickToLockModal);
    const t = useT();

    if (locked || !pointer.canLock || !mouseCapture) {
        return null;
    }

    if (clickToLockModal) {
        return <div class="absolute top-0 left-0 w-full h-full flex flex-col items-center
        justify-center pointer-events-none bg-black/70 gap-2 px-4 py-2 text-white text-center">
            <div class="text-4xl">{t("click_to_lock")}</div>
            <div class="text-xl">{t("use_esc_key_to_unlock")}</div>
            <div class="text-xl">{t("use_slider_to_change_sensitivity")}</div>
            <div class="text-sm">{t("current_sensitivity")}: {mouseSensitivity.toFixed(2)}</div>
        </div>;
    } else {
        return <div class="absolute top-6 left-0 w-full pointer-events-none flex flex-row items-center justify-center">
            <div class="flex flex-col items-center justify-center bg-black/70 gap-2 px-4 py-2 text-white text-center
                rounded-lg">
                <div class="text-4xl">{t("click_to_lock")}</div>
                <div class="text-xl">{t("use_esc_key_to_unlock")}</div>
                <div class="text-xl">{t("use_slider_to_change_sensitivity")}</div>
                <div class="text-sm">{t("current_sensitivity")}: {mouseSensitivity.toFixed(2)}</div>
            </div>
        </div>;
    }
}

function DosRuntime(props: { canvas: HTMLCanvasElement, ci: CommandInterface }) {
    const { canvas, ci } = props;
    const bundle = useSelector((state: State) => state.dos.bundle);

    useDosRuntime(canvas, ci);

    return <>
        <Unload ci={ci} />
        {isDhry2Bundle(bundle) && <Dhry2Results ci={ci} />}
    </>;
}

let unloadResolveFn = () => { };
function Unload(props: { ci: CommandInterface }) {
    const ci = props.ci;
    const t = useT();
    const store = useStore() as Store;
    const nonSerializableStore = useNonSerializableStore();

    const [open, setOpen] = useState<boolean>(false);
    const [busy, setBusy] = useState<boolean>(false);
    const [openResult, setOpenResult] = useState<boolean | null>(null);

    useEffect(() => {
        if (openResult !== null) {
            setBusy(true);
            const finallyFn = () => {
                setBusy(false);
                unloadResolveFn();
            };
            if (openResult) {
                apiSave(store.getState() as any, nonSerializableStore, store.dispatch, true)
                    .catch(console.error)
                    .finally(finallyFn);
            } else {
                finallyFn();
            }
        }
    }, [openResult]);

    useEffect(() => {
        ci.events().onUnload(() => {
            return new Promise((resolve) => {
                setOpen(true);
                unloadResolveFn = resolve;
            });
        });
    }, [ci]);

    if (open) {
        return <dialog id="save-dialog" className="modal" open={true}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">{t("emulation_ended")}</h3>
                <p className="py-4">{t("confirm_save")}</p>
                <div className="modal-action">
                    <form method="dialog" className="join">
                        <button className="btn btn-neutral join-item" onClick={() => {
                            setOpen(false);
                            setOpenResult(false);
                        }}>{t("close")}</button>
                        <button className="btn btn-primary join-item" onClick={() => {
                            setOpen(false);
                            setOpenResult(true);
                        }}>{t("save")}</button>
                    </form>
                </div>
            </div>
        </dialog>;
    }

    if (busy) {
        return <dialog id="busy-dialog" className="modal" open={true}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">{t("emulation_ended")}</h3>
                <div class="flex flex-row gap-4 py-4 items-center">
                    <span class="loading loading-spinner loading-lg"></span>
                    <p>{t("saving_game")}</p>
                </div>
            </div>
        </dialog>;
    }

    return null;
}
