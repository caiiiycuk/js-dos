import { Store } from "@reduxjs/toolkit";
import { DosEditorErrorCode, DosEditorOperation } from "./public/types";
import { getNonSerializableStore, getState } from "./store";

export class DosEditorError extends Error {
    constructor(public code: DosEditorErrorCode, message: string, public revision: number,
                public completed: string[] = []) {
        super(message);
        this.name = "DosEditorError";
    }
}

const queues = new WeakMap<Store, Promise<unknown>>();

export function editorOperation<T>(store: Store, options: DosEditorOperation, operation: () => Promise<T>): Promise<T> {
    const result = (queues.get(store) ?? Promise.resolve()).then(() => {
        const revision = getState(store as any).editor.revision;
        if (getNonSerializableStore(store).stopped) {
            throw new DosEditorError("not-ready", "The player has stopped", revision);
        }
        if (options.expectedRevision !== undefined && options.expectedRevision !== revision) {
            throw new DosEditorError("conflict", "Editor revision changed", revision);
        }
        return operation();
    });
    queues.set(store, result.catch(() => {}));
    return result;
}
