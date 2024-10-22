import { createSlice } from "@reduxjs/toolkit";
import { DosAction, getNonSerializableStore, makeStore, postJsDosEvent } from "../store";
import { Emulators } from "emulators";
import { lStorage } from "../host/lstorage";

const alphabet = "qwertyuiopasdfghjklzxcvbnm1234567890";
declare const emulators: Emulators;
export interface BundleConfig {
    name?: string,
    version?: string,
    backend?: string,
    render?: string,
};

export const BackendValues = <const>["dosbox", "dosboxX"];
export type Backend = typeof BackendValues[number];

export const RenderBackendValues = <const>["webgl", "canvas"];
export type RenderBackend = typeof RenderBackendValues[number];

export const RenderAspectValues = <const>["AsIs", "1/1", "5/4", "4/3", "16/10", "16/9", "Fit"];
export type RenderAspect = typeof RenderAspectValues[number];
export const FitConstant = 65535;

export const ImageRenderingValues = <const>["pixelated", "smooth"];
export type ImageRendering = typeof ImageRenderingValues[number];

export interface EmulatorStats {
    cyclesPerMs: number,
    nonSkippableSleepPreSec: number,
    sleepPerSec: number,
    sleepTimePerSec: number,
    framePerSec: number,
    soundPerSec: number,
    msgSentPerSec: number,
    msgRecvPerSec: number,
    netSent: number,
    netRecv: number,
    driveSent: number,
    driveRecv: number,
    driveRecvTime: number,
    driveCacheHit: number,
    driveCacheMiss: number,
    driveCacheUsed: number,
    driveBufferedAmount: number,
    driveIo: { read: number, write: number }[];
};

const initialState: {
    step:
    "emu-init" | "emu-error" | "emu-ready" |
    "bnd-load" | "bnd-error" | "bnd-config" | "bnd-ready" |
    "bnd-play",
    emuVersion: string,
    worker: boolean,
    backend: Backend,
    backendLocked: boolean,
    backendHardware: boolean,
    renderBackend: RenderBackend,
    renderAspect: RenderAspect,
    volume: number,
    mobileControls: boolean,
    mirroredControls: boolean,
    scaleControls: number,
    mouseSensitivity: number,
    mouseCapture: boolean,
    paused: boolean,
    error: null | undefined | string,
    bundle: string | null,
    config: BundleConfig,
    stats: EmulatorStats,
    ci: boolean,
    ciStartedAt: number,
    network: {
        server: "netherlands" | "newyork" | "singapore",
        room: string,
        ipx: "connecting" | "connected" | "disconnected" | "error",
    },
    imageRendering: ImageRendering,
    sockdriveWrite: boolean,
    sockdriveInfo: { drive: string, write: boolean}[],
    sockdriveNative: boolean,
    softKeyboard: boolean,
    softKeyboardLayout: string[][][],
    softKeyboardSymbols: {[key: string]: string}[],
    softKeyboardActiveSymbols: number,
    softKeyboardActiveLayout: number,
    noCursor: boolean,
} = {
    step: "emu-init",
    emuVersion: "-",
    error: null,
    bundle: null,
    config: {},
    worker: lStorage.getItem("worker") !== "false",
    backend: (lStorage.getItem("backend") ?? "dosbox") as Backend,
    backendLocked: false,
    backendHardware: (lStorage.getItem("backendHardware") !== "false"),
    renderBackend: (lStorage.getItem("renderBackend") ?? "webgl") as RenderBackend,
    renderAspect: (lStorage.getItem("renderAspect") ?? "AsIs") as RenderAspect,
    volume: (Number.parseFloat(lStorage.getItem("volume") ?? "1.0")),
    mobileControls: false,
    mirroredControls: lStorage.getItem("mirroredControls") === "true",
    scaleControls: (Number.parseFloat(lStorage.getItem("scaleControls") ?? "0.2")),
    mouseSensitivity: (Number.parseFloat(lStorage.getItem("mouse_sensitivity") ?? "1.0")),
    mouseCapture: false,
    paused: false,
    stats: {
        cyclesPerMs: 0,
        nonSkippableSleepPreSec: 0,
        sleepPerSec: 0,
        sleepTimePerSec: 0,
        framePerSec: 0,
        soundPerSec: 0,
        msgSentPerSec: 0,
        msgRecvPerSec: 0,
        netRecv: 0,
        netSent: 0,
        driveSent: 0,
        driveRecv: 0,
        driveRecvTime: 0,
        driveCacheHit: 0,
        driveCacheMiss: 0,
        driveCacheUsed: 0,
        driveBufferedAmount: 0,
        driveIo: [],
    },
    network: {
        server: (lStorage.getItem("net.server") ?? "netherlands") as any,
        room: randomRoom(),
        ipx: "disconnected",
    },
    ci: false,
    ciStartedAt: 0,
    imageRendering: (lStorage.getItem("imageRendering") ?? "pixelated") as any,
    sockdriveWrite: true,
    sockdriveInfo: [],
    sockdriveNative: (lStorage.getItem("sockdriveNative") === "true"),
    softKeyboard: false,
    softKeyboardLayout: [
        [
            [
                "{esc} {f1} {f2} {f3} {f4}",
                "0 1 2 3 4",
                "5 6 7 8 9",
                "{ } ( ) {shift}",
                "{layout} {ctrl} {alt} {space}",
            ],
            [
                "{f5} {f6} {f7} {f8}",
                "{pgup} {pgdown} {bksp}",
                "",
                "{up}",
                "{left} {down} {right}",
            ],
            [
                "{f9} {f10} {f11} {f12}",
                "{del} {kp7} {kp8} {kp9}",
                "{tab} {kp4} {kp5} {kp6}",
                "- {kp1} {kp2} {kp3}",
                "+ {kp0} . {enter}",
            ],
        ],
        [
            [
                "{esc} ` 1 2 3 4 5 6 7 8 9 0 ( ) - = {bksp} {enter}",
                "{tab} q w e r t y u i o p { } \\ [ ] {up}",
                "{shift} {left} {right} a s d f g h j k l : ; ' [ {down}",
                "{layout} {symbols} {alt} {ctrl} z x c v b n m , . / ] {space}",
            ],
        ],
    ],
    softKeyboardSymbols: [
        {
            "{esc}": "␛",
            "{bksp}": "⌫",
            "{enter}": "↵",
            "{up}": "↑",
            "{down}": "↓",
            "{left}": "←",
            "{right}": "→",
            "{shift}": "⇑",
            "{layout}": "⎘",
            "{pgup}": "PgUp",
            "{pgdown}": "PgDown",
            "{kp7}": "↖",
            "{kp8}": "↑",
            "{kp9}": "↗",
            "{kp5}": "5",
            "{kp4}": "←",
            "{kp6}": "→",
            "{kp1}": "↙",
            "{kp2}": "↓",
            "{kp3}": "↘",
            "{kp0}": "0",
            "{symbols}": "En/Ru",
        },
        {
            "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е",
            "y": "н", "u": "г", "i": "ш", "o": "щ", "p": "з",
            "{": "х", "}": "ъ", "a": "ф", "s": "ы", "d": "в",
            "f": "а", "g": "п", "h": "р", "j": "о", "k": "л",
            "l": "д", ";": "ж", "'": "э", "z": "я", "x": "ч",
            "c": "с", "v": "м", "b": "и", "n": "т", "m": "ь",
            ",": "б", ".": "ю",
        },
    ],
    softKeyboardActiveSymbols: 0,
    softKeyboardActiveLayout: 0,
    noCursor: false,
};

export type DosState = typeof initialState;

export const dosSlice = createSlice({
    name: "dos",
    initialState,
    reducers: {
        emuReady: (s, a: { payload: string }) => {
            s.step = "emu-ready";
            s.emuVersion = a.payload;
        },
        emuError: (s, a: { payload: string }) => {
            s.step = "emu-error";
            s.error = a.payload ?? "Unexpeceted error";
        },
        bndLoad: (s, a: { payload: string }) => {
            s.step = "bnd-load";
            s.bundle = a.payload;
        },
        bndError: (s, a: { payload: string }) => {
            s.step = "bnd-error";
            s.error = a.payload ?? "Unexpeceted error";
        },
        bndConfig: (s) => {
            s.step = "bnd-config";
        },
        bndReady: (s, a: { payload: BundleConfig }) => {
            s.step = "bnd-ready";
            s.config = a.payload;
        },
        bndPlay: (s, a) => {
            s.step = "bnd-play";
            (a as unknown as DosAction).asyncStore((store) => {
                postJsDosEvent(getNonSerializableStore(store), "bnd-play");
            });
        },
        dosWorker: (s, a: { payload: boolean }) => {
            s.worker = a.payload;
            lStorage.setItem("worker", s.worker ? "true" : "false");
        },
        dosBackend: (s, a: { payload: Backend }) => {
            s.backend = a.payload as Backend;
        },
        dosBackendLocked: (s, a: { payload: boolean }) => {
            s.backendLocked = a.payload;
        },
        dosBackendHardware: (s, a: { payload: boolean }) => {
            s.backendHardware = a.payload;
            lStorage.setItem("backendHardware", s.backendHardware ? "true" : "false");
        },
        renderBackend: (s, a: { payload: RenderBackend }) => {
            s.renderBackend = a.payload;
            lStorage.setItem("renderBackend", s.renderBackend);
        },
        renderAspect: (s, a: { payload: RenderAspect }) => {
            s.renderAspect = a.payload;
            lStorage.setItem("renderAspect", s.renderAspect);
        },
        imageRendering: (s, a: { payload: ImageRendering }) => {
            s.imageRendering = a.payload;
            lStorage.setItem("imageRendering", s.imageRendering);
        },
        volume: (s, a: { payload: number }) => {
            s.volume = a.payload;
            lStorage.setItem("volume", s.volume + "");
        },
        mouseSensitivity: (s, a: { payload: number }) => {
            s.mouseSensitivity = a.payload;
            lStorage.setItem("mouse_sensitivity", s.mouseSensitivity + "");
        },
        mouseCapture: (s, a: { payload: boolean }) => {
            s.mouseCapture = a.payload;
        },
        paused: (s, a: { payload: boolean }) => {
            s.paused = a.payload;
        },
        stats: (s, a: { payload: EmulatorStats }) => {
            s.stats = a.payload;
        },
        ci: (s, a: { payload: boolean }) => {
            s.ci = a.payload;
            if (a.payload) {
                s.ciStartedAt = Date.now();
            }
        },
        connectIpx: (s, a: { payload: { room: string, address: string } }) => {
            if (s.network.ipx === "connected") {
                throw new Error("Already connected");
            }

            if (!s.ci) {
                throw new Error("DOS is not started");
            }

            const { room, address } = a.payload;
            s.network.ipx = "connecting";
            (a as unknown as DosAction).asyncStore((store) => {
                const nonSerializableStore = getNonSerializableStore(store);
                if (!nonSerializableStore.ci) {
                    throw new Error("DOS is not started");
                }

                const canonicalAddress = address.endsWith("/") ?
                    address.substring(0, address.length - 1) :
                    address;

                nonSerializableStore.ci.networkConnect(0 /* NetworkType.NETWORK_DOSBOX_IPX */,
                    canonicalAddress + ":1900/ipx/" + room.replaceAll("@", "_"))
                    .then(() => {
                        store.dispatch(dosSlice.actions.statusIpx("connected"));
                    })
                    .catch((e) => {
                        store.dispatch(dosSlice.actions.statusIpx("error"));
                        console.error(e);
                    });
            });
        },
        statusIpx: (s, a: { payload: "error" | "connected" | "connecting" }) => {
            s.network.ipx = a.payload;
        },
        disconnectIpx: (s, a) => {
            s.network.ipx = "disconnected";
            (a as unknown as DosAction).asyncStore((store) => {
                getNonSerializableStore(store).ci?.networkDisconnect(0 /* IPX */);
            });
        },
        setRoom: (s, a: { payload: string }) => {
            s.network.room = a.payload;
        },
        setServer: (s, a: { payload: typeof initialState.network.server }) => {
            s.network.server = a.payload;
            lStorage.setItem("net.server", a.payload);
        },
        setSockdriveWrite: (s, a: { payload: boolean }) => {
            s.sockdriveWrite = a.payload;
        },
        setSockdriveNative: (s, a: { payload: boolean }) => {
            s.sockdriveNative = a.payload;
            lStorage.setItem("sockdriveNative", a.payload ? "true" : "false");
        },
        addSockdriveInfo: (s, a: { payload: { drive: string, write: boolean} }) => {
            s.sockdriveInfo.push(a.payload);
        },
        mobileControls: (s, a: { payload: boolean }) => {
            s.mobileControls = a.payload;
        },
        mirroredControls: (s, a: { payload: boolean }) => {
            s.mirroredControls = a.payload;
            lStorage.setItem("mirroredControls", a.payload ? "true" : "false");
        },
        scaleControls: (s, a: { payload: number }) => {
            s.scaleControls = a.payload;
            lStorage.setItem("scaleControls", s.scaleControls + "");
        },
        softKeyboard: (s, a: { payload: boolean }) => {
            s.softKeyboard = a.payload;
        },
        softKeyboardLayout: (s, a: { payload: string[] | string[][][] }) => {
            if (a.payload.length > 0 && Array.isArray(a.payload[0])) {
                s.softKeyboardLayout = a.payload as string[][][];
            } else {
                s.softKeyboardLayout = [[a.payload as string[]]];
            }
        },
        softKeyboardSymbols: (s, a: { payload: {[key: string]: string}[] }) => {
            s.softKeyboardSymbols = a.payload;
        },
        softKeyboardActiveSymbols: (s, a: { payload: number }) => {
            s.softKeyboardActiveSymbols = a.payload;
        },
        softKeyboardActiveLayout: (s, a: { payload: number }) => {
            s.softKeyboardActiveLayout = a.payload;
        },
        noCursor: (s, a: { payload: boolean }) => {
            s.noCursor = a.payload;
        },
    },
});

let emulatorsReady = false;
export function initEmulators(store: ReturnType<typeof makeStore>, pathPrefix: string) {
    store.dispatch(async (dispatch) => {
        try {
            if (!emulatorsReady) {
                await initEmulatorsJs(pathPrefix);
                emulatorsReady = true;
            }
            dispatch(dosSlice.actions.emuReady(emulators.version));
        } catch (e) {
            console.error("Unable to init emulators.js", e);
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    });
}

function initEmulatorsJs(pathPrefix: string) {
    const el = document.querySelector("#emulators.js");
    if (el !== null) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.src = pathPrefix + "emulators.js";
        script.onload = () => {
            emulators.pathPrefix = pathPrefix;
            resolve();
        };
        script.onerror = (err) => {
            reject(new Error("Unable to add emulators.js. Probably you should set the " +
                "'pathPrefix' option to point to the js-dos folder."));
        };

        document.head.appendChild(script);
    });
};

function randomSymbol() {
    return alphabet[Math.round(Math.random() * (alphabet.length - 1))];
}

function randomRoom() {
    return randomSymbol() + randomSymbol() + randomSymbol();
}
