import { createAction, createSlice } from "@reduxjs/toolkit";

const initialState: {
    modal: "none" | "login",
    frame: "none" | "account" | "output" | "editor-fs",
    window: "none" | "error" | "loading" | "prerun" | "run" | "upload" | "editor",
} = {
    modal: "none",
    frame: "none",
    window: "none",
};

export const uiSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
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
        windowUpload: (state) => {
            state.window = "upload";
        },
        windowEditor: (state) => {
            state.window = "editor";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createAction<string>("dos/bndLoad"), (s, a) => {
                s.window = "loading";
            })
            .addCase(createAction<string>("dos/bndReady"), (s, a) => {
                s.window = "prerun";
            })
            .addCase(createAction<string>("dos/bndPlay"), (s, a) => {
                s.window = "run";
            })
            .addMatcher((action: {type: string}) => {
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
