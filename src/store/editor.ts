import { createSlice } from "@reduxjs/toolkit";
import { dosboxconf } from "../window/editor/defaults";

const initialState: {
    step: "conf" | "preview" | "extract" | "bundler" | "error",
    dosboxconf: string,
    errorMessage: string | null,
} = {
    step: "conf",
    dosboxconf: dosboxconf[0].contents,
    errorMessage: null,
};

export const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        extract: (s) => {
            s.step = "extract";
        },
        stepConf: (s) => {
            s.step = "conf";
        },
        stepPreview: (s) => {
            if (s.step === "conf") {
                // s.step = "bundler";
                // makeBundle(nonSerializedDosState.editorBundle, s.dosboxconf);
                // TODO: FS layer -> new bundle

                s.step = "preview";
            } else if (s.step !== "preview") {
                s.step = "preview";
            }
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
