import { storageSlice } from "../store/storage";
import { Account } from "../store/auth";
import { brCdn, isDhry2Bundle } from "../v8/config";
import { Store, getNonSerializableStore } from "../store";
import { canDoCloudSave } from "../player-api";

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


export async function changesFromUrl(url: string, account: Account | null,
                                     store: Store): Promise<Uint8Array | null> {
    if (!canDoCloudSave(account, null)) {
        return await getNonSerializableStore(store).cache.get(url).catch(() => null);
    }

    try {
        const response = await fetch(url, {
            cache: "no-cache",
        });

        if (response.status !== 200) {
            throw new Error("Resource not avalible (" + response.status + "): " + response.statusText);
        }

        return await readResponseBody(response, url, (bytes, length) => {
            store.dispatch(storageSlice.actions.changedProgress([bytes, length]));
        });
    } catch (e: any) {
        return await getNonSerializableStore(store).cache.get(url).catch(() => null);
    }
}

export async function bundleFromUrl(url: string, store: Store): Promise<Uint8Array> {
    try {
        if (!isDhry2Bundle(url)) {
            return await getNonSerializableStore(store).cache.get(url);
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

    getNonSerializableStore(store).cache
        .put(url, complete)
        .catch(console.error);

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
