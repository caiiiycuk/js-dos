import { Dispatch, createAction, createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../host/lstorage";
import { Account } from "./auth";
import { DosAction } from "../store";
import { dosSlice } from "./dos";

export const ThemeValues = <const>["light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi",
    "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business",
    "acid", "lemonade", "night", "coffee", "winter"];
export type Theme = typeof ThemeValues[number];

export type Frame = "none" | "account" | "settings" |
    "editor-conf" | "editor-fs" | "network" |
    "stats" | "fat-drives" | "quick-save" |
    "prerun";

const initialState: {
    hidden: boolean,
    modal: "none" | "login",
    frame: Frame,
    frameXs: boolean,
    window: "none" | "error" | "loading" | "prerun" | "run" | "select",
    theme: Theme,
    editor: boolean,
    wideScreen: boolean,
    fullScreen: boolean,
    toast: string | null,
    toastIntent: "none" | "error" | "success" | "panic",
    toastTimeoutId: number,
    background: string | null,
    readOnlyWarning: boolean,
    updateWsWarning: boolean,
    cloudSaves: boolean,
    autoStart: boolean,
    kiosk: boolean,
    documentHidden: boolean,
    noNetworking: boolean,
    noCloud: boolean,
} = {
    hidden: false,
    modal: "none",
    frame: "none",
    frameXs: false,
    window: "none",
    theme: (lStorage.getItem("theme") ?? "dark") as Theme,
    editor: false,
    wideScreen: true,
    fullScreen: false,
    toast: null,
    toastIntent: "none",
    toastTimeoutId: 0,
    background: null,
    readOnlyWarning: false,
    updateWsWarning: false,
    cloudSaves: true,
    autoStart: false,
    kiosk: false,
    documentHidden: document.hidden ?? false,
    noNetworking: true,
    noCloud: false,
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
        modalLogin: (state) => {
            state.modal = "login";
        },
        modalNone: (state) => {
            state.modal = "none";
        },
        frameNone: (state) => {
            state.frame = "none";
            state.frameXs = false;
        },
        frameAccount: (state) => {
            toggleFrameIfNeeded(state, "account");
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
        frameQuickSave: (state) => {
            state.frame = "quick-save";
            state.frameXs = true;
        },
        framePreRun: (state) => {
            state.frame = "prerun";
            state.frameXs = false;
        },
        windowSelect: (state) => {
            state.window = "select";
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
        readOnlyWarning: (state, a: { payload: boolean }) => {
            state.readOnlyWarning = a.payload;
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

function toggleFrameIfNeeded(
    state: typeof initialState,
    newFrame: typeof initialState.frame) {
    if (state.frame === newFrame) {
        state.frame = "none";
    } else {
        state.frame = newFrame;
    }
}

export function dispatchLoginAction(account: Account | null, dispatch: Dispatch) {
    if (account === null) {
        dispatch(uiSlice.actions.modalLogin());
    } else {
        dispatch(uiSlice.actions.frameAccount());
    }
}
