import { createAction, createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../storage/storage";

export const ThemeValues = <const>["light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
    "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi",
    "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business",
    "acid", "lemonade", "night", "coffee", "winter"];
export type Theme = typeof ThemeValues[number];

const initialState: {
    modal: "none" | "login",
    frame: "none" | "account" | "output" | "editor-conf" | "editor-fs",
    window: "none" | "error" | "loading" | "prerun" | "run" | "upload",
    theme: Theme,
} = {
    modal: "none",
    frame: "none",
    window: "none",
    theme: (lStorage.getItem("theme") ?? "dark") as Theme,
};

export const uiSlice = createSlice({
    name: "app",
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
        },
        frameAccount: (state) => {
            toggleFrameIfNeeded(state, "account");
        },
        frameOutput: (state) => {
            state.frame = "output";
        },
        frameConf: (state) => {
            state.frame = "editor-conf";
        },
        frameFs: (state) => {
            state.frame = "editor-fs";
        },
        windowUpload: (state) => {
            state.window = "upload";
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
                s.window = "prerun";
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
