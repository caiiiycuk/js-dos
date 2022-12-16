import { createSlice } from "@reduxjs/toolkit";
import { Login } from "./auth/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";

const initialState: {
    modal: "none" | "login",
    frame: "none" | "account",
} = {
    modal: "none",
    frame: "none",
};

export const appSlice = createSlice({
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


export function App() {
    return <div class="w-full h-full relative">
        <Frame />
        <SideBar />
        <Login />
    </div>;
};

