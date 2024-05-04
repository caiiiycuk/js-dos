import { createSlice } from "@reduxjs/toolkit";
import { lStorage } from "../host/lstorage";

export const makeVMBackendNames = ["localhost", "make-vm.com"];
export type MakevmBackendName = typeof makeVMBackendNames[number];
export const makeVMBackend: {
    [key: MakevmBackendName]: {
        makevmEndpoint: string,
        makevmWssEndpoint: string,
    }
} = {
    "make-vm.com": {
        makevmEndpoint: "https://backend.make-vm.com:8001",
        makevmWssEndpoint: "wss://backend.make-vm.com:8001",
    },
    "localhost": {
        makevmEndpoint: "http://localhost:8001",
        makevmWssEndpoint: "ws://localhost:8001",
    },
};

export interface InitState {
    uid: string,
    makevmBackendName: MakevmBackendName,
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
                makevmBackendName: lStorage.getItem("makevm.backend.name") ?? "make-vm.com",
            },
            reducers: {
                setMakeVMBackendName: (state, a: { payload: MakevmBackendName }) => {
                    state.makevmBackendName = a.payload;
                    lStorage.setItem("makevm.backend.name", a.payload);
                },
            },
        }),
    };
}

export const initSlice = createInitSlice().slice;
