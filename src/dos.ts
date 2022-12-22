import { createSlice } from "@reduxjs/toolkit";
import { makeStore } from "./store";
import { Emulators } from "emulators";

declare const emulators: Emulators;

const initialState: {
    step:
    "emu-init" | "emu-error" | "emu-ready" |
    "bnd-load" | "bnd-ready",
    error: null | undefined | string,
    bundle: string | null,
} = {
    step: "emu-init",
    error: null,
    bundle: null,
};

export const dosSlice = createSlice({
    name: "dos",
    initialState,
    reducers: {
        emuReady: (s) => {
            s.step = "emu-ready";
        },
        emuError: (s, a: { payload: string }) => {
            s.step = "emu-error";
            s.error = a.payload ?? "Unexpeceted error";
        },
        bndLoad: (s, a: { payload: string }) => {
            s.step = "bnd-load";
            s.bundle = a.payload;
        },
        bndReady: (s) => {
            s.step = "bnd-ready";
        },
    },
});

export function initEmulators(store: ReturnType<typeof makeStore>) {
    store.dispatch(async (dispatch) => {
        try {
            await initEmulatorsJs();
            dispatch(dosSlice.actions.emuReady());
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
