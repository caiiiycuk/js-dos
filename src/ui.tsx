import { createAction, createSlice } from "@reduxjs/toolkit";
import { Login } from "./auth/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { Window } from "./window/window";

const initialState: {
    modal: "none" | "login",
    frame: "none" | "account",
    window: "none" | "error" | "loading" | "prerun" | "run" | "upload",
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
        windowUpload: (s) => {
            s.window = "upload";
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

export function Ui() {
    return <div class="w-full h-full relative">
        <Window />
        <Frame />
        <SideBar />
        <Login />
    </div>;
};

