import { storageSlice } from "../store/storage";
import { Dispatch } from "@reduxjs/toolkit";
import { nonSerializableStore } from "../non-serializable-store";
import { Account } from "../store/auth";
import { brCdn } from "../v8/config";

export function bundleFromFile(file: File, dispatch: Dispatch): Promise<Uint8Array> {
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


export async function bundleFromChanges(url: string, account: Account | null): Promise<Uint8Array | null> {
    if (account === null || !account.premium) {
        return await nonSerializableStore.cache.get(url).catch(() => null);
    }

    try {
        const response = await fetch(url, {
            cache: "no-cache",
        });

        if (response.status !== 200) {
            throw new Error("Resource not avalible (" + response.status + "): " + response.statusText);
        }

        return response.arrayBuffer().then((b) => new Uint8Array(b));
    } catch (e: any) {
        return await nonSerializableStore.cache.get(url).catch(() => null);
    }
}

export async function bundleFromUrl(url: string, dispatch: Dispatch): Promise<Uint8Array> {
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

        const bytes = Math.min(url.startsWith(brCdn) ? received / 2 : received, length);
        dispatch(storageSlice.actions.progress([bytes, length]));
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
