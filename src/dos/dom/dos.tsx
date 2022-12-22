import { createSlice } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import { makeStore, State } from "../../store";
import { DosLoading } from "./dos-loading";
import { DosPlayer } from "./dos-player";

declare const emulators: Emulators;

const initialState: {
    loaded: boolean,
} = {
    loaded: false,
};

export const dosSlice = createSlice({
    name: "dos",
    initialState,
    reducers: {
        loaded: (state) => {
            state.loaded = true;
        },
    },
});

export function DosWindow(props: {}) {
    const frameOpened = useSelector((state: State) => state.app.frame) !== "none";
    return <div class="absolute w-full h-full bg-red-600 flex flex-row">
        <div class={ frameOpened ? "w-96" : "w-12" }></div>
        <Dos/>
    </div>;
}

export function Dos(props: { class?: string }) {
    const loaded = useSelector((state: State) => state.dos.loaded);
    const [impl, setImpl] = useState<Emulators | null>(null);

    useEffect(() => {
        if (loaded) {
            setImpl(emulators);
        }
    }, [loaded]);

    if (impl === null) {
        return <DosLoading />;
    }

    return <DosPlayer emulators={emulators} />;
}

export function initEmulators(store: ReturnType<typeof makeStore>) {
    store.dispatch(async (dispatch) => {
        try {
            await initEmulatorsJs();
            dispatch(dosSlice.actions.loaded());
        } catch (e) {
            console.error("Unable to init emulators.js", e);
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
