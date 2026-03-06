import { createSlice } from "@reduxjs/toolkit";
import { Store } from "../store";

const initialState: {
    freeSpace: number | null,
    usage: number | null,
} = {
    freeSpace: null,
    usage: null,
};

export type OpfsState = typeof initialState;

export const opfsSlice = createSlice({
    name: "opfs",
    initialState,
    reducers: {
        setFreeSpace: (state, action: { payload: number | null }) => {
            state.freeSpace = action.payload;
        },
        setUsage: (state, action: { payload: number | null }) => {
            state.usage = action.payload;
        },
    },
});

export function updateOpfsStats(store: Store) {
    getFreeSpace().then((freeSpace) => {
        store.dispatch(opfsSlice.actions.setFreeSpace(freeSpace));
    }).catch(console.error);
    getUsage().then((usage) => {
        store.dispatch(opfsSlice.actions.setUsage(usage));
    }).catch(console.error);
}

export type Entry = {
    name: string,
    type: "folder" | "file",
    size?: number,
}

async function getRootHandle(): Promise<FileSystemDirectoryHandle> {
    return await (await navigator.storage.getDirectory()).getDirectoryHandle("jsdos", { create: true });
}

export async function getPath(pathIds: string[]): Promise<FileSystemDirectoryHandle> {
    let dir = await getRootHandle();

    for (const segment of pathIds) {
        if (segment !== "") {
            dir = await dir.getDirectoryHandle(segment, { create: true });
        }
    }

    return dir;
}

export async function getEntries(directory: FileSystemDirectoryHandle): Promise<Entry[]> {
    const entries: Entry[] = [];

    for await (const [name, handle] of (directory as any)) {
        const entry: Entry = {
            name: name,
            type: handle.kind === "directory" ? "folder" : "file",
        };

        if (entry.type === "file") {
            try {
                const file = await (handle as FileSystemFileHandle).getFile();
                entry.size = file.size;
            } catch (_e) {/* ignore */}
        } else {
            entry.size = await getDirSize(handle as FileSystemDirectoryHandle);
        }

        entries.push(entry);
    }

    return entries;
}

async function getDirSize(dir: FileSystemDirectoryHandle): Promise<number> {
    let size = 0;
    for await (const [, handle] of (dir as any)) {
        if (handle.kind === "file") {
            const file = await (handle as FileSystemFileHandle).getFile();
            size += file.size;
        } else {
            size += await getDirSize(handle as FileSystemDirectoryHandle);
        }
    }
    return size;
}

async function get(key: string, handle: FileSystemDirectoryHandle) {
    const filename = keyToDirectory(key);
    try {
        const file = await handle.getFileHandle(filename, { create: false });
        return new Uint8Array(await (await file.getFile()).arrayBuffer());
    } catch {
        console.log("Changes not found", key);
        return null;
    }
}

async function put(key: string, data: Uint8Array, handle: FileSystemDirectoryHandle) {
    const filename = keyToDirectory(key);
    const file = await handle.getFileHandle(filename, { create: true });
    const writable = await file.createWritable();
    await writable.write(data.buffer);
    await writable.close();
}


export async function getChanges(key: string) {
    const saves = await getPath(["saves"]);
    return get(key, saves);
}

export async function getBundle(key: string) {
    const bundles = await getPath(["caches", "bundles"]);
    return get(key, bundles);
}

export async function putChanges(key: string, data: Uint8Array) {
    const saves = await getPath(["saves"]);
    return put(key, data, saves);
}

export async function putBundle(key: string, data: Uint8Array) {
    const bundles = await getPath(["caches", "bundles"]);
    return put(key, data, bundles);
}

export async function deleteChanges(key: string) {
    const saves = await getPath(["saves"]);
    const filename = keyToDirectory(key);
    try {
        await saves.removeEntry(filename, { recursive: false });
    } catch { }
}

export async function getUsage() {
    return getDirSize(await getRootHandle());
}

export async function getFreeSpace() {
    const { quota, usage } = await navigator.storage.estimate();
    if (quota === undefined || usage === undefined) {
        return null;
    }
    console.log(formatBytes(quota), formatBytes(usage));
    return quota - usage;
}

export function formatBytes(bytes: number | null | undefined): [number, string] | null {
    if (bytes === null || bytes === undefined) {
        return null;
    }

    if (bytes < 1024) {
        return [bytes, "B"];
    }
    if (bytes < 1024 * 1024) {
        return [Math.ceil(bytes / 1024), "KB"];
    }
    if (bytes < 1024 * 1024 * 1024) {
        return [Math.ceil(bytes / 1024 / 1024), "MB"];
    }
    return [Math.ceil(bytes / 1024 / 1024 / 1024), "GB"];
}

function keyToDirectory(url: string): string {
    return url
        .replace(/^https?:\/\//, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .substring(0, 200);
}
