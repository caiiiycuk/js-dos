import { createSlice } from "@reduxjs/toolkit";
import { DosConfig } from "emulators";
import { Node } from "react-checkbox-tree";
import { dosboxconf } from "../frame/editor/defaults";

const initialState: {
    // step: "empty" | "extract" | "ready" | "error",
    configChanged: boolean,
    bundleConfig: DosConfig | null,
    errorMessage: string | null,
    fs: Node[],
} = {
    // step: "empty",
    configChanged: false,
    bundleConfig: null,
    errorMessage: null,
    fs: [],
};

export type EditorState = typeof initialState;

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        init: (s, a: { payload: DosConfig | null }) => {
            if (a.payload === null) {
                s.configChanged = true;
                s.bundleConfig = {
                    dosboxConf: dosboxconf[0].contents,
                    jsdosConf: {
                        version: "js-dos-v8",
                    },
                };
            } else {
                s.configChanged = false;
                s.bundleConfig = a.payload;
            }
        },
        dosboxConf: (s, a: { payload: string }) => {
            s.configChanged = true;
            s.bundleConfig!.dosboxConf = a.payload;
        },
        // empty: (s) => {
        //     s.step = "empty";
        // },
        // extract: (s) => {
        //     s.step = "extract";
        // },
        // ready: (s) => {
        //     s.step = "ready";
        // },
        // config: (s, a: { payload: DosConfig | null }) => {
        //     s.bundleConfig = a.payload;
        // },
        // error: (s, a: { payload: string }) => {
        //     s.step = "error";
        //     s.errorMessage = a.payload;
        // },
    },
});
