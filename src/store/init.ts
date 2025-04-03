import { createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../host/lstorage";

export interface InitState {
    uid: string,
};

let storeUid = -1;
export function createInitSlice() {
    storeUid += 1;
    return {
        storeUid,
        slice: createSlice({
            name: "init",
            initialState: {
                uid: storeUid,
            },
            reducers: {
            },
        }),
    };
}

export const initSlice = createInitSlice().slice;
