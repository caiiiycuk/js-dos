import { Emulators, CommandInterface, InitFs } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { useDispatch, useSelector, useStore } from "react-redux";
import { dosSlice } from "../../store/dos";
import { State, useNonSerializableStore, postJsDosEvent, Store } from "../../store";
import { useDosRuntime } from "./dos-runtime";
import { apiExit } from "../../player-api-exit";
import { Dhry2Results } from "./dos-dhry2";
import { createWsTransportLayer } from "../../ws/ws-transport-layer";
import { actualWsVersion, isDhry2Bundle } from "../../v8/config";
import { uiSlice } from "../../store/ui";
import { extractLayersConfig } from "../../layers/controls/layers-config";
import { pointer } from "./controls/mouse/pointer";
import { SoftKeyboard } from "../soft-keyboard";
import { useT } from "../../i18n";
import { apiSave } from "../../player-api";
import { createNet } from "../../webrtcnet/webrtcnet";
import { initMt32Integration, feedMidiByte, disposeMt32 } from "./mt32/mt32-integration";

declare const emulators: Emulators;

export function DosWindow(props: {
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);
    const worker = useSelector((state: State) => state.dos.worker);
    const jspi = useSelector((state: State) => state.dos.jspi);
    const mcpServerPort = useSelector((state: State) => state.dos.mcpServerPort);
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
    const startIpxServer = useSelector((state: State) => state.dos.startIpxServer);
    const connectIpxAddress = useSelector((state: State) => state.dos.connectIpxAddress);
    const t = useT();

    useEffect(() => {
        let disposed = false;
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

            loadedBundle.bundleChanges = null;
            loadedBundle.initFs = null;

            let serverPeerId: number = 0;
            const ci: Promise<CommandInterface> = (async () => {
                if (backendHardware && nonSerializableStore.options.backendHardware) {
                    if (backend === "dosboxX") {
                        console.error("backendHardware is not supported for dosboxX");
                    } else {
                        const ws = await nonSerializableStore.options.backendHardware(backend);
                        if (ws !== null) {
                            return emulators.backend(bundles, await createWsTransportLayer(ws, (version) => {
                                if (version < actualWsVersion) {
                                    dispatch(uiSlice.actions.updateWsWarning(true));
                                }
                                console.log("wsServer:", version, " expected:", actualWsVersion);
                            }), {
                                sockdrivePreload,
                            });
                        }
                    }
                };

                if (useOffscreenCanvas && canvasRef.current !== null &&
                    typeof canvasRef.current.transferControlToOffscreen === "function") {
                    nonSerializableStore.offscreenCanvas = canvasRef.current.transferControlToOffscreen();
                }

                nonSerializableStore.net?.shutdown();
                if (startIpxServer || connectIpxAddress) {
                    const text = startIpxServer ? t("create_server") : t("lookup_address") + ": " + connectIpxAddress;
                    dispatch(uiSlice.actions.modalText({ text }));
                    nonSerializableStore.net = await createNet(
                        (peerId) => console.log("network error for peer", peerId),
                        () => console.log("network disconnected"),
                        nonSerializableStore,
                    );
                    if (connectIpxAddress) {
                        const net = nonSerializableStore.net;
                        const parsedId = Number.parseInt(connectIpxAddress);
                        if (parsedId) {
                            serverPeerId = Number.parseInt(connectIpxAddress);
                        } else {
                            serverPeerId = await new Promise<number>((resolve) => {
                                const resolveFn = async () => {
                                    const aliases = await net.queryAliases("=" + connectIpxAddress);
                                    if (aliases.length === 1) {
                                        resolve(aliases[0].peerId);
                                    } else {
                                        setTimeout(resolveFn, 100);
                                    }
                                };
                                setTimeout(resolveFn, 4);
                            });
                        }
                    }

                    dispatch(uiSlice.actions.modalTextClear());
                } else {
                    nonSerializableStore.net = undefined;
                }

                const useMcpServer = backend === "dosboxX" && worker && mcpServerPort !== 0;
                let backendName = "dosbox";
                switch (backend) {
                    case "dosboxX":
                        backendName = "dosboxX";
                        if (jspi) {
                            backendName += "Jspi";
                        }
                        if (useMcpServer) {
                            backendName += "Debug";
                        }
                        break;
                    default:
                        // dosbox
                        break;
                }

                return (emulators as any)[backendName + (worker ? "Worker" : "Direct")](bundles, {
                    canvas: nonSerializableStore.offscreenCanvas,
                    audioWorklet: true,
                    sockdrivePreload,
                    sockdriveOpfsRoot: nonSerializableStore.opfsRoot,
                    net: nonSerializableStore.net,
                    ...(useMcpServer ? { mcpServerPort } : {}),
                });
            })();

            nonSerializableStore.pendingCi = ci;
            ci
                .then(async (ci) => {
                    if (nonSerializableStore.stopped || disposed) {
                        return apiExit(ci);
                    }
                    setCi(ci);
                    dispatch(dosSlice.actions.ci(true));

                    // Initializing the Roland MT-32 emulator and Web Audio
                    await initMt32Integration();

                    // Hooking into the capture of the MIDI byte stream from emulator events
                    ci.events().onMessage((name: string, props: any) => {
                        console.log("[DOS Message Debug]", name, props);
                        if (name === "midi-byte" || name === "MIDI Raw Byte") {
                            feedMidiByte(props.data);
                        }
                    });

                    if (pointer.mobile) {
                        ci.config()
                            .then((c) => {
                                dispatch(dosSlice.actions.mobileControls(extractLayersConfig(c.jsdosConf) !== null));
                            })
                            .catch((e) => dispatch(dosSlice.actions.emuError(e.message)));
                    }
                    nonSerializableStore.ci = ci;
                    if (startIpxServer) {
                        ci.sendBackendEvent({
                            type: "wc-trigger-event",
                            event: "hand_ipx_startserver",
                        });
                    } else if (connectIpxAddress && nonSerializableStore.net) {
                        dispatch(uiSlice.actions.modalText({
                            text: t("connect_to_network") + ": " + connectIpxAddress,
                        }));
                        ci.events().onNetworkConnected(() => {
                            dispatch(uiSlice.actions.modalTextClear());
                        });
                        ci.events().onNetworkDisconnected(() => {
                            dispatch(uiSlice.actions.modalText({
                                text: t("unable_to_connect_to_network"),
                                loading: false,
                            }));
                            apiExit(ci).catch((error) => console.warn("Unable to stop DOS backend", error));
                        });
                        ci.networkConnect(0 /* NetworkType.NETWORK_DOSBOX_IPX */, serverPeerId.toString());
                    }
                    postJsDosEvent(nonSerializableStore, "ci-ready", ci);
                })
                .catch((error) => {
                    if (nonSerializableStore.pendingCi === ci) nonSerializableStore.pendingCi = undefined;
                    if (!nonSerializableStore.stopped && !disposed) dispatch(dosSlice.actions.emuError(error.message));
                });

            return () => {
                disposed = true;
                ci.then((ci) => {
                    if (nonSerializableStore.ci === ci) {
                        dispatch(dosSlice.actions.ci(false));
                        nonSerializableStore.ci = null;
                        disposeMt32(); // Shut down the MT-32 and release audio resources upon exit
                    }
                    return apiExit(ci);
                }).catch((error) => console.warn("Unable to clean up DOS backend", error));
            };
        } catch (e) {
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    }, [worker, backend, jspi, mcpServerPort, useOffscreenCanvas, sockdrivePreload, startIpxServer, connectIpxAddress]);

    return <div class="flex flex-col flex-grow h-full overflow-hidden">
        <div class="bg-black h-full flex-grow overflow-hidden relative">
            <canvas class={cursor} ref={canvasRef} />
            {canvasRef.current && ci && <DosRuntime canvas={canvasRef.current} ci={ci} />}
            <ClickToLock />
            <ModalText />
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

function ModalText() {
    const modalText = useSelector((state: State) => state.ui.modalText);
    const modalTextLoading = useSelector((state: State) => state.ui.modalTextLoading);

    if (!modalText) {
        return null;
    }

    return <div class="absolute top-0 left-0 w-full h-full flex flex-row items-center
        justify-center pointer-events-none bg-black/70 gap-2 px-4 py-2 text-white text-center">
        {modalTextLoading && <span class="loading loading-spinner loading-md"></span>}
        <div class="text-4xl">{modalText}</div>
    </div>;
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
            if (nonSerializableStore.editorExiting) {
                return Promise.resolve();
            }
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
