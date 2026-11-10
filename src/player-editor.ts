import { Store } from "@reduxjs/toolkit";
import { Emulators } from "emulators";
import { DosEditorApi, DosEditorConfig, DosEditorOperation, DosEditorState } from "./public/types";
import { getNonSerializableStore, getState } from "./store";
import { dosSlice } from "./store/dos";
import { editorSlice } from "./store/editor";
import { uiSlice } from "./store/ui";
import { applySockdriveOptionsIfNeeded, commitBundle, readBundleConfig } from "./player-api-load";
import { apiExit } from "./player-api-exit";
import { DosEditorError, editorOperation } from "./player-editor-queue";

declare const emulators: Emulators;

const editors = new WeakMap<Store, DosEditorApi>();

export function getEditor(store: Store): DosEditorApi {
    const existing = editors.get(store);
    if (existing) {
        return existing;
    }
    const nonSerializableStore = getNonSerializableStore(store);
    function state(): DosEditorState {
        const current = getState(store as any);
        return structuredClone({
            revision: current.editor.revision,
            dirty: current.editor.dirty,
            bundle: current.dos.bundle,
            ready: current.dos.ci && nonSerializableStore.ci !== null,
            step: current.dos.step,
            error: current.dos.error ?? null,
            config: current.editor.bundleConfig,
            runningConfig: current.editor.runningConfig,
            paused: current.dos.paused,
            hidden: current.ui.documentHidden,
            runInBackground: nonSerializableStore.options.runInBackground === true,
            audio: nonSerializableStore.audioState ?? "uninitialized",
            volume: current.dos.volume,
        });
    }
    function fail(code: DosEditorError["code"], message: string): never {
        throw new DosEditorError(code, message, state().revision);
    }
    function ci() {
        if (!state().ready) {
            fail("not-ready", "The emulator filesystem is not ready; start the bundle first");
        }
        return nonSerializableStore.ci!;
    }
    function path(value: string) {
        if (!value || value.startsWith("/") || /[\\:\x00]/.test(value) ||
            value.split("/").some((part) => !part || part === "." || part === "..")) {
            fail("invalid-input", "Expected a relative file path without traversal");
        }
        return value;
    }
    function validateConfig(config: DosEditorConfig) {
        if (!config || typeof config.dosboxConf !== "string" || !config.jsdosConf ||
            typeof config.jsdosConf.version !== "string") {
            fail("invalid-input", "Expected dosboxConf and jsdosConf.version");
        }
    }
    async function exit() {
        nonSerializableStore.editorExiting = true;
        try {
            await apiExit(nonSerializableStore.ci);
            nonSerializableStore.ci = null;
            store.dispatch(dosSlice.actions.ci(false));
        } finally {
            nonSerializableStore.editorExiting = false;
        }
    }
    async function snapshot() {
        const current = state();
        if (!current.config) {
            fail("not-ready", "No bundle is open");
        }
        const backend = current.ready ? ci() : null;
        if (!backend && current.step === "bnd-play") {
            fail("not-ready", "The emulator is starting");
        }
        nonSerializableStore.editorSnapshotting = true;
        backend?.pause();
        try {
            let bundle = backend ? await backend.persist(false) : nonSerializableStore.loadedBundle?.bundle;
            if (bundle && typeof bundle === "object" && !ArrayBuffer.isView(bundle) && "dosboxConf" in bundle) {
                bundle = await (await emulators.bundle()).toUint8Array();
            }
            if (!(bundle instanceof Uint8Array)) {
                fail("not-ready", "A complete bundle snapshot is unavailable");
            }
            if (!backend && (nonSerializableStore.loadedBundle?.bundleChanges ||
                nonSerializableStore.loadedBundle?.initFs)) {
                fail("not-ready", "Start this bundle to merge its changes and initial files before exporting");
            }
            return {
                bundle: await emulators.bundleUpdateConfig(bundle.slice(), current.config!),
                revision: current.revision,
                warnings: /sockdrive|\.qcow2/i.test(current.config!.dosboxConf) ?
                    ["External disk resources are not embedded; this bundle is not standalone"] : [],
            };
        } finally {
            nonSerializableStore.editorSnapshotting = false;
            const latest = state();
            if (backend && !latest.paused && (!latest.hidden || latest.runInBackground)) {
                backend.resume();
            }
        }
    }
    async function start() {
        const current = state();
        if (current.ready) {
            fail("conflict", "The emulator is already running; use restart");
        }
        if (!current.config || !nonSerializableStore.loadedBundle?.bundle) {
            fail("not-ready", "No launchable bundle is open");
        }
        if (current.step === "bnd-play") {
            fail("not-ready", "The emulator is already starting");
        }
        const loaded = nonSerializableStore.loadedBundle;
        applySockdriveOptionsIfNeeded(current.config.dosboxConf, store.dispatch);
        if (loaded.bundle instanceof Uint8Array) {
            loaded.bundle = await emulators.bundleUpdateConfig(loaded.bundle.slice(), current.config);
        } else {
            loaded.bundle = structuredClone(current.config);
        }
        store.dispatch(editorSlice.actions.started(current.config));
        store.dispatch(dosSlice.actions.bndPlay({}));
        const deadline = Date.now() + 30000;
        while (!state().ready) {
            if (state().step.endsWith("error")) {
                fail("backend", state().error ?? "Emulator initialization failed");
            }
            if (Date.now() >= deadline) {
                fail("timeout", "Timed out waiting for the emulator");
            }
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
        return state();
    }
    const editor: DosEditorApi = {
        state,
        open: (bundle, options = {}) => editorOperation(store, options, async () => {
            if (!(bundle instanceof Uint8Array) || bundle.length === 0) {
                fail("invalid-input", "Expected a nonempty ZIP bundle");
            }
            let config;
            try {
                config = await readBundleConfig(bundle);
            } catch (error) {
                fail("invalid-input", "Invalid bundle: " + (error as Error).message);
            }
            if (!config) {
                fail("invalid-input", "Missing .jsdos/dosbox.conf");
            }
            validateConfig(config!);
            if (state().dirty && options.discardChanges !== true) {
                fail("conflict", "Replacing unsaved edits requires discardChanges");
            }
            if (state().step === "bnd-play" && !state().ready) {
                fail("not-ready", "Wait for emulator initialization before replacing the bundle");
            }
            if (nonSerializableStore.ci) {
                await exit();
            }
            commitBundle(store, {
                bundle: bundle.slice(), bundleUrl: null, bundleChangesUrl: null, bundleChanges: null, initFs: null,
            }, config!, "bundle.jsdos");
            store.dispatch(uiSlice.actions.frameConf());
            store.dispatch(uiSlice.actions.setEditor(true));
            return state();
        }),
        setConfig: (config, options = {}) => editorOperation(store, options, async () => {
            validateConfig(config);
            if (!state().config) {
                fail("not-ready", "No bundle is open");
            }
            store.dispatch(editorSlice.actions.config(structuredClone(config)));
            store.dispatch(dosSlice.actions.mouseCapture(config.dosboxConf.includes("autolock=true")));
            return state();
        }),
        tree: () => editorOperation(store, {}, () => ci().fsTree()),
        readFile: (file) => editorOperation(store, {}, () => ci().fsReadFile(path(file))),
        files: (operations, options = {}) => editorOperation(store, options, async () => {
            const backend = ci();
            const completed: string[] = [];
            for (const operation of operations) {
                path(operation.path);
            }
            try {
                for (const operation of operations) {
                    if ("delete" in operation) {
                        if (!await backend.fsDeleteFile(operation.path)) {
                            throw new Error("Could not delete " + operation.path);
                        }
                    } else {
                        await backend.fsWriteFile(operation.path, operation.contents);
                    }
                    completed.push(operation.path);
                    store.dispatch(editorSlice.actions.filesChanged());
                }
            } catch (error) {
                throw new DosEditorError("backend", (error as Error).message, state().revision, completed);
            }
            return state();
        }),
        start: (options = {}) => editorOperation(store, options, start),
        restart: (options = {}) => editorOperation(store, options, async () => {
            const result = await snapshot();
            await exit();
            nonSerializableStore.loadedBundle = {
                bundle: result.bundle, bundleUrl: null, bundleChangesUrl: null, bundleChanges: null, initFs: null,
            };
            store.dispatch(dosSlice.actions.bndReady({}));
            await new Promise((resolve) => setTimeout(resolve, 40));
            return start();
        }),
        snapshot: (options: DosEditorOperation = {}) => editorOperation(store, options, snapshot),
    };
    editors.set(store, editor);
    return editor;
}
