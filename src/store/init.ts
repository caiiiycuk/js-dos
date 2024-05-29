import { createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../host/lstorage";

export const sockdriveBackendNames = ["localhost", "js-dos"];
export type SockdriveBackendName = typeof sockdriveBackendNames[number];
export const sockdriveBackend: {
    [key: SockdriveBackendName]: {
        sockdriveEndpoint: string,
        sockdriveWssEndpoint: string,
    }
} = {
    "js-dos": {
        sockdriveEndpoint: "https://sockdrive.js-dos.com:8001",
        sockdriveWssEndpoint: "wss://sockdrive.js-dos.com:8001",
    },
    "localhost": {
        sockdriveEndpoint: "http://localhost:8001",
        sockdriveWssEndpoint: "ws://localhost:8001",
    },
};

export interface InitState {
    uid: string,
    sockdriveBackendName: SockdriveBackendName,
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
                sockdriveBackendName: lStorage.getItem("sockdrive.backend.name") ?? "js-dos",
            },
            reducers: {
                setSockdriveBackendName: (state, a: { payload: SockdriveBackendName }) => {
                    state.sockdriveBackendName = a.payload;
                    lStorage.setItem("sockdrive.backend.name", a.payload);
                },
            },
        }),
    };
}

export const initSlice = createInitSlice().slice;
