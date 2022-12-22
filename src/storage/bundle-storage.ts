import { createSlice } from "@reduxjs/toolkit";
import { makeStore } from "../store";

const initialState: {
    recived: number,
    total: number,
} = {
    recived: 0,
    total: 0,
};

export const storageSlice = createSlice({
    name: "storage",
    initialState,
    reducers: {
        reset: (s) => {
            s.recived = -1;
            s.total = 0;
        },
        progress: (s, a: { payload: [number, number ] }) => {
            s.recived = a.payload[0];
            s.total = a.payload[1];
        },
    },
});

export class BundleStorage {
    private store: ReturnType<typeof makeStore>;
    constructor(s: ReturnType<typeof makeStore>) {
        this.store = s;
    }

    async load(url: string): Promise<Uint8Array[]> {
        this.store.dispatch(storageSlice.actions.reset());

        const response = await fetch(url, {
            cache: "default",
        });

        const lenHeader = response.headers.get("Content-Length");
        const length = lenHeader === null ? 0 :
            Number.parseInt(lenHeader);
        const reader = response.body!.getReader();

        let received = 0;
        const chunks: Uint8Array[] = [];
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            received += value.length;

            this.store.dispatch(storageSlice.actions.progress([received, length]));
        }

        return chunks;
    };
}
