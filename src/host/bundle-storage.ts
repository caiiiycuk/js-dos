import { storageSlice } from "../store/storage";
import { brCdn, isDhry2Bundle } from "../v8/config";
import { Store, getNonSerializableStore } from "../store";
import { getBundle, getChanges, putBundle } from "./opfs";

export function bundleFromFile(file: File, store: Store): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve) => {
        store.dispatch(storageSlice.actions.reset());
        const reader = new FileReader();
        reader.addEventListener("load", async (e) => {
            resolve(new Uint8Array(reader.result as ArrayBuffer));
        });
        reader.addEventListener("progress", (e) => {
            store.dispatch(storageSlice.actions.progress([e.loaded, e.total]));
        });
        reader.readAsArrayBuffer(file);
    });
}


export async function changesFromUrl(url: string, store: Store): Promise<Uint8Array | null> {
    const nonSerializableStore = await getNonSerializableStore(store);

    if (nonSerializableStore.options.fsChanges?.pull) {
        return await nonSerializableStore.options.fsChanges.pull(url);
    }

    if (nonSerializableStore.options.fsChanges?.local !== false) {
        try {
            return await getChanges(url);
        } catch (e: any) {
            console.error(e);
            return null;
        }
    }

    return null;
}

export async function bundleFromUrl(url: string, store: Store): Promise<Uint8Array> {
    try {
        if (!isDhry2Bundle(url)) {
            const bundle = await getBundle(url);
            if (bundle !== null) {
                return bundle;
            }
        }
    } catch (e: any) {
        // ignore
    }

    store.dispatch(storageSlice.actions.reset());
    const response = await fetch(url, {
        cache: "no-store",
    });

    if (response.status !== 200) {
        throw new Error("Resource not avalible (" + response.status + "): " + response.statusText);
    }

    const complete = await readResponseBody(response, url, (bytes, length) => {
        store.dispatch(storageSlice.actions.progress([bytes, length]));
    });

    putBundle(url, complete).catch(console.error);

    return complete;
};


async function readResponseBody(response: Response, url: string,
    onProgress: (bytes: number, total: number) => void): Promise<Uint8Array> {
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
        onProgress(bytes, length);
    }

    let offset = 0;
    const complete = new Uint8Array(received);
    for (const next of chunks) {
        complete.set(next, offset);
        offset += next.length;
    }

    return complete;
}
