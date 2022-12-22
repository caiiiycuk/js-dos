import { createAction, createSlice } from "@reduxjs/toolkit";
import { Login } from "./auth/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { Window } from "./window/window";

const initialState: {
    modal: "none" | "login",
    frame: "none" | "account",
    window: "none" | "error" | "loading" | "dos",
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
        frameAccount: (state) =>
            toggleFrameIfNeeded(state, "account"),
    },
    extraReducers: (builder) => {
        builder
            .addCase(createAction<string>("dos/emuError"), (s, a) => {
                s.window = "error";
            })
            .addCase(createAction<string>("dos/bndLoad"), (s, a) => {
                s.window = "loading";
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

