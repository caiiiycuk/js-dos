import { createSlice } from "@reduxjs/toolkit";

const initialState: {
    recived: number,
    total: number,
    ready: boolean,
} = {
    recived: 0,
    total: 0,
    ready: false,
};

export type StorageState = typeof initialState;

export const storageSlice = createSlice({
    name: "storage",
    initialState,
    reducers: {
        reset: (s) => {
            s.recived = -1;
            s.total = 0;
            s.ready = false;
        },
        progress: (s, a: { payload: [number, number ] }) => {
            s.recived = a.payload[0];
            s.total = a.payload[1];
        },
        ready: (s) => {
            s.ready = true;
        },
    },
});
