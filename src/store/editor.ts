import { createSlice } from "@reduxjs/toolkit";
import { Node } from "react-checkbox-tree";
import { dosboxconf } from "../frame/editor/defaults";

const initialState: {
    step: "empty" | "extract" | "ready" | "error",
    dosboxconf: string,
    errorMessage: string | null,
    fs: Node[],
} = {
    step: "empty",
    dosboxconf: dosboxconf[0].contents,
    errorMessage: null,
    fs: [],
};

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        empty: (s) => {
            s.step = "empty";
        },
        extract: (s) => {
            s.step = "extract";
        },
        ready: (s) => {
            s.step = "ready";
        },
        dosboxConf: (s, a: { payload: string }) => {
            s.dosboxconf = a.payload;
        },
        error: (s, a: { payload: string }) => {
            s.step = "error";
            s.errorMessage = a.payload;
        },
    },
});
