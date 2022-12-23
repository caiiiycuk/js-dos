import { createSlice } from "@reduxjs/toolkit";
import { makeStore } from "./store";
import { Emulators } from "emulators";
import { lStorage } from "./storage/storage";

declare const emulators: Emulators;

export interface BundleConfig {
    name?: string,
    version?: string,
    backend?: string,
    render?: string,
};

type Backend = "dosbox" | "dosboxX";

const initialState: {
    step:
    "emu-init" | "emu-error" | "emu-ready" |
    "bnd-load" | "bnd-error" | "bnd-config" | "bnd-ready" |
    "bnd-play",
    emuVersion: string,
    worker: boolean,
    backend: Backend,
    error: null | undefined | string,
    bundle: string | null,
    config: BundleConfig,
} = {
    step: "emu-init",
    emuVersion: "-",
    error: null,
    bundle: null,
    config: {},
    worker: lStorage.getItem("worker") !== "false",
    backend: (lStorage.getItem("backend") ?? "dosbox") as Backend,
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
            lStorage.setItem("worker", s.worker + "");
        },
        dosBackend: (s, a: { payload: Backend | string }) => {
            s.backend = a.payload as Backend;
            lStorage.setItem("backend", s.backend);
        },
    },
});

export const nonSerializedDosState: {
    bundle: Uint8Array[] | null
} = {
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
        const pathPrefix = "http://localhost:8080/";
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
