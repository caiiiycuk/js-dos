import { createAction, createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../host/lstorage";
import { DosAction } from "../store";
import { dosSlice } from "./dos";

export const ThemeValues = <const>["light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi",
    "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business",
    "acid", "lemonade", "night", "coffee", "winter"];
export type Theme = typeof ThemeValues[number];

export type Frame = "none" | "settings" |
    "editor-conf" | "editor-fs" | "network" |
    "stats" | "fat-drives" |
    "prerun";

const initialState: {
    hidden: boolean,
    frame: Frame,
    frameXs: boolean,
    window: "none" | "error" | "loading" | "prerun" | "run" | "select",
    theme: Theme,
    editor: boolean,
    wideScreen: boolean,
    fullScreen: boolean,
    toast: string | null,
    toastIntent: "none" | "error" | "success" | "panic" | "warning",
    toastTimeoutId: number,
    background: string | null,
    updateWsWarning: boolean,
    cloudSaves: boolean,
    autoStart: boolean,
    kiosk: boolean,
    documentHidden: boolean,
    noNetworking: boolean,
    noCloud: boolean,
    warnOnPremium: boolean,
    warnOnKey: boolean,
} = {
    hidden: false,
    frame: "none",
    frameXs: false,
    window: "none",
    theme: (lStorage.getItem("theme") ?? "light") as Theme,
    editor: false,
    wideScreen: true,
    fullScreen: false,
    toast: null,
    toastIntent: "none",
    toastTimeoutId: 0,
    background: null,
    updateWsWarning: false,
    cloudSaves: true,
    autoStart: false,
    kiosk: false,
    documentHidden: document.hidden ?? false,
    noNetworking: true,
    noCloud: false,
    warnOnKey: false,
    warnOnPremium: false,
};

export type UiState = typeof initialState;

export const uiSlice = createSlice({
    name: "js-dos v8s",
    initialState,
    reducers: {
        theme: (state, a: { payload: Theme }) => {
            lStorage.setItem("theme", a.payload);
            state.theme = a.payload;
        },
        frameNone: (state) => {
            state.frame = "none";
            state.frameXs = false;
        },
        frameSettings: (state) => {
            state.frame = "settings";
            state.frameXs = false;
        },
        frameNetwork: (state) => {
            state.frame = "network";
            state.frameXs = false;
        },
        frameStats: (state) => {
            state.frame = "stats";
            state.frameXs = false;
        },
        frameConf: (state) => {
            state.frame = "editor-conf";
            state.frameXs = false;
        },
        frameFs: (state) => {
            state.frame = "editor-fs";
            state.frameXs = false;
        },
        frameFatDrives: (state) => {
            state.frame = "fat-drives";
            state.frameXs = false;
        },
        framePreRun: (state) => {
            state.frame = "prerun";
            state.frameXs = false;
        },
        windowSelect: (state) => {
            state.window = "select";
            state.editor = true;
        },
        background: (state, a: { payload: string }) => {
            state.background = a.payload;
        },
        setEditor: (state, a: { payload: boolean }) => {
            state.editor = a.payload;
        },
        setWideScreen: (state, a: { payload: boolean }) => {
            state.wideScreen = a.payload;
        },
        setFullScreen: (state, a: { payload: boolean }) => {
            state.fullScreen = a.payload;
        },
        showToast: (state, a: {
            payload: {
                message: string, intent?: typeof initialState.toastIntent,
                long?: boolean
            }
        }) => {
            if (state.toastTimeoutId !== 0) {
                clearInterval(state.toastTimeoutId);
            }
            state.toast = a.payload.message;
            state.toastIntent = a.payload.intent ?? "none";
            if (a.payload.intent !== "panic") {
                state.toastTimeoutId = setTimeout(() => {
                    (a as unknown as DosAction).asyncStore((store) => store.dispatch(uiSlice.actions.hideToast()));
                }, a.payload.long ? 5000 : 1500);
            }
        },
        hideToast: (state) => {
            state.toast = null;
            state.toastTimeoutId = 0;
        },
        updateWsWarning: (state, a: { payload: boolean }) => {
            state.updateWsWarning = a.payload;
        },
        cloudSaves: (state, a: { payload: boolean }) => {
            state.cloudSaves = a.payload;
        },
        autoStart: (state, a: { payload: boolean }) => {
            state.autoStart = a.payload;
        },
        kiosk: (state, a: { payload: boolean }) => {
            state.kiosk = a.payload;
        },
        documentHidden: (s, a: { payload: boolean }) => {
            s.documentHidden = a.payload;
        },
        noNetworking: (state, a: { payload: boolean }) => {
            state.noNetworking = a.payload;
        },
        noCloud: (state, a: { payload: boolean }) => {
            state.noCloud = a.payload;
        },
        hidden: (state, a: { payload: boolean }) => {
            state.hidden = a.payload;
        },
        warnOnKey: (state, a: { payload: boolean }) => {
            state.warnOnKey = a.payload;
            state.frame = "none";
        },
        warnOnPremium: (state, a: { payload: boolean }) => {
            state.warnOnKey = a.payload;
            state.frame = "none";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createAction<string>("dos/bndLoad"), (s, a) => {
                s.window = "loading";
            })
            .addCase(createAction<string>("editor/extract"), (s, a) => {
                s.window = "loading";
            })
            .addCase(createAction<string>("editor/ready"), (s, a) => {
                s.window = "prerun";
            })
            .addCase(createAction<string>("dos/bndReady"), (s, a) => {
                if (s.autoStart) {
                    (a as unknown as DosAction).asyncStore((store) => {
                        store.dispatch(dosSlice.actions.bndPlay({}));
                    });
                } else {
                    s.window = "prerun";
                }
            })
            .addCase(createAction<string>("dos/bndPlay"), (s, a) => {
                s.window = "run";
                s.frame = "none";
            })
            .addMatcher((action: { type: string }) => {
                return action.type.startsWith("dos/") &&
                    action.type.endsWith("Error");
            }, (s, a) => {
                s.window = "error";
            });
    },
});

