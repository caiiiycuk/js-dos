import { createSlice } from "@reduxjs/toolkit";
import { makeStore } from "../store";
import { Emulators } from "emulators";
import { lStorage } from "../storage/storage";

declare const emulators: Emulators;

export interface BundleConfig {
    name?: string,
    version?: string,
    backend?: string,
    render?: string,
};

export const BackendValues = <const> ["dosbox", "dosboxX"];
export type Backend = typeof BackendValues[number];

export const RenderBackendValues = <const> ["webgl", "canvas"];
export type RenderBackend = typeof RenderBackendValues[number];

export const RenderAspectValues = <const> ["Game", "1/1", "5/4", "4/3", "16/10", "16/9", "Fit"];
export type RenderAspect = typeof RenderAspectValues[number];
export const FitConstant = 65535;

export interface EmulatorStats {
    sleepPerSec: number,
    cyclesPerMs: number,
};

const initialState: {
    step:
    "emu-init" | "emu-error" | "emu-ready" |
    "bnd-load" | "bnd-error" | "bnd-config" | "bnd-ready" |
    "bnd-play",
    emuVersion: string,
    worker: boolean,
    backend: Backend,
    renderBackend: RenderBackend,
    renderAspect: RenderAspect,
    volume: number,
    mouseSensitivity: number,
    mouseLock: boolean,
    paused: boolean,
    error: null | undefined | string,
    bundle: string | null,
    config: BundleConfig,
    stats: EmulatorStats,
} = {
    step: "emu-init",
    emuVersion: "-",
    error: null,
    bundle: null,
    config: {},
    worker: lStorage.getItem("worker") !== "false",
    backend: (lStorage.getItem("backend") ?? "dosbox") as Backend,
    renderBackend: (lStorage.getItem("renderBackend") ?? "webgl") as RenderBackend,
    renderAspect: (lStorage.getItem("renderAspect") ?? "AsIs") as RenderAspect,
    volume: (Number.parseFloat(lStorage.getItem("volume") ?? "1.0")),
    mouseSensitivity: (Number.parseFloat(lStorage.getItem("mouse_sensitivity") ?? "1.0")),
    mouseLock: false,
    paused: false,
    stats: {
        sleepPerSec: 0,
        cyclesPerMs: 0,
    },
};

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
        },
        dosWorker: (s, a: { payload: boolean }) => {
            s.worker = a.payload;
            lStorage.setItem("worker", s.worker ? "true" : "false");
        },
        dosBackend: (s, a: { payload: Backend }) => {
            s.backend = a.payload as Backend;
            lStorage.setItem("backend", s.backend);
        },
        renderBackend: (s, a: { payload: RenderBackend }) => {
            s.renderBackend = a.payload;
            lStorage.setItem("renderBackend", s.renderBackend);
        },
        renderAspect: (s, a: { payload: RenderAspect }) => {
            s.renderAspect = a.payload;
            lStorage.setItem("renderAspect", s.renderAspect);
        },
        volume: (s, a: { payload: number}) => {
            s.volume = a.payload;
            lStorage.setItem("volume", s.volume + "");
        },
        mouseSensitivity: (s, a: { payload: number}) => {
            s.mouseSensitivity = a.payload;
            lStorage.setItem("mouse_sensitivity", s.mouseSensitivity + "");
        },
        mouseLock: (s, a: { payload: boolean}) => {
            s.mouseLock = a.payload;
        },
        paused: (s, a: { payload: boolean}) => {
            s.paused = a.payload;
        },
        stats: (s, a: { payload: EmulatorStats }) => {
            s.stats = a.payload;
        },
    },
});

export const nonSerializedDosState: {
    editorBundle: Uint8Array | null,
    bundle: Uint8Array[] | null
} = {
    editorBundle: null,
    bundle: null,
};

export function initEmulators(store: ReturnType<typeof makeStore>) {
    store.dispatch(async (dispatch) => {
        try {
            await initEmulatorsJs();
            dispatch(dosSlice.actions.emuReady(emulators.version));
        } catch (e) {
            console.error("Unable to init emulators.js", e);
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    });
}

function initEmulatorsJs() {
    const el = document.querySelector("#emulators.js");
    if (el !== null) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
        const pathPrefix = "/emulators/";
        const script = document.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.src = pathPrefix + "emulators.js";
        script.onload = () => {
            emulators.pathPrefix = pathPrefix;
            resolve();
        };
        script.onerror = (err) => {
            reject(new Error("Unable to add emulators.js"));
        };

        document.head.appendChild(script);
    });
};
