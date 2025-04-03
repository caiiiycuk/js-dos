import { createSlice } from "@reduxjs/toolkit";

const initialState: {
    recived: number,
    total: number,
    changedRecived: number,
    changedTotal: number,
    ready: boolean,
} = {
    recived: 0,
    total: 0,
    changedRecived: 0,
    changedTotal: 0,
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
            s.changedRecived = 0;
            s.changedTotal = 0;
            s.ready = false;
        },
        progress: (s, a: { payload: [number, number ] }) => {
            s.recived = a.payload[0];
            s.total = a.payload[1];
        },
        changedProgress: (s, a: { payload: [number, number ] }) => {
            s.changedRecived = a.payload[0];
            s.changedTotal = a.payload[1];
        },
        ready: (s) => {
            s.ready = true;
        },
    },
});
