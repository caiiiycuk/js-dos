import { createSlice } from "@reduxjs/toolkit";
import { Login } from "./auth/login";
import { SideBar } from "./sidebar/sidebar";

const initialState: {
    modal: "none" | "login",
} = {
    modal: "none",
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
    },
});


export function App() {
    return <div class="w-full h-full relative">
        <SideBar />
        <Login />
    </div>;
};

