import { storageSlice } from "../store/storage";
import { Dispatch } from "@reduxjs/toolkit";
import { nonSerializableStore } from "../non-serializable-store";

export function loadFile(file: File, dispatch: Dispatch): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve) => {
        dispatch(storageSlice.actions.reset());
        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
        });
        reader.addEventListener("progress", (e) => {
            dispatch(storageSlice.actions.progress([e.loaded, e.total]));
        });
        reader.readAsArrayBuffer(file);
    });
}

export async function loadUrl(url: string, dispatch: Dispatch): Promise<Uint8Array> {
    try {
        return await nonSerializableStore.cache.get(url);
    } catch (e: any) {
        // ignore
    }

    dispatch(storageSlice.actions.reset());
    const response = await fetch(url, {
        cache: "no-store",
    });

    if (response.status !== 200) {
        throw new Error("Resource not avalible (" + response.status + "): " + response.statusText);
    }

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

        dispatch(storageSlice.actions.progress([received, length]));
    }

    let offset = 0;
    const complete = new Uint8Array(received);
    for (const next of chunks) {
        complete.set(next, offset);
        offset += next.length;
    }

    nonSerializableStore.cache
        .put(url, complete)
        .catch(console.error);

    return complete;
};

