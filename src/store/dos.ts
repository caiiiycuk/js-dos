import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { makeStore, State } from "../store";
import { Emulators } from "emulators";
import { lStorage } from "../host/lstorage";
import { nonSerializableStore, postJsDosEvent } from "../non-serializable-store";

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
    mouseSensitivity: number,
    mouseCapture: boolean,
    paused: boolean,
    error: null | undefined | string,
    bundle: string | null,
    config: BundleConfig,
    stats: EmulatorStats,
    ci: boolean,
    network: {
        server: "netherlands" | "newyork" | "singapore",
        room: string,
        ipx: "connecting" | "connected" | "disconnected" | "error",
    },
    imageRendering: ImageRendering,
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
    },
    network: {
        server: (lStorage.getItem("net.server") ?? "netherlands") as any,
        room: randomRoom(),
        ipx: "disconnected",
    },
    ci: false,
    imageRendering: (lStorage.getItem("imageRendering") ?? "pixelated") as any,
};

const connectIpx = createAsyncThunk("dos/connectIpx",
    async (payload: { room: string, address: string }, thunkApi) => {
        const dos = (thunkApi.getState() as State).dos;
        if (dos.network.ipx === "connected") {
            throw new Error("Already connected");
        }
        if (dos.ci === false || !nonSerializableStore.ci) {
            throw new Error("DOS is not started");
        }

        const canonicalAddress = payload.address.endsWith("/") ?
            payload.address.substring(0, payload.address.length - 1) :
            payload.address;

        return nonSerializableStore.ci.networkConnect(0 /* NetworkType.NETWORK_DOSBOX_IPX */,
            canonicalAddress + ":1900/ipx/" + payload.room.replaceAll("@", "_"));
    });

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
        bndPlay: (s) => {
            s.step = "bnd-play";
            postJsDosEvent("bnd-play");
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
        },
        disconnectIpx: (s) => {
            s.network.ipx = "disconnected";
            nonSerializableStore.ci?.networkDisconnect(0 /* IPX */);
        },
        setRoom: (s, a: { payload: string }) => {
            s.network.room = a.payload;
        },
        setServer: (s, a: { payload: typeof initialState.network.server }) => {
            s.network.server = a.payload;
            lStorage.setItem("net.server", a.payload);
        },
    },
    extraReducers: {
        [connectIpx.fulfilled.type]: (state) => {
            state.network.ipx = "connected";
        },
        [connectIpx.pending.type]: (state) => {
            state.network.ipx = "connecting";
        },
        [connectIpx.rejected.type]: (state) => {
            state.network.ipx = "error";
        },
    },
});

export const dosExtraActions = {
    connectIpx,
};

export function initEmulators(store: ReturnType<typeof makeStore>, pathPrefix: string) {
    store.dispatch(async (dispatch) => {
        try {
            await initEmulatorsJs(pathPrefix);
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
