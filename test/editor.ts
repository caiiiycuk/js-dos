import { Dos as createDos } from "../src/main";
import { getEditor } from "../src/player-editor";
import { makeNonSerializableStore, makeStore } from "../src/store";
import { editorSlice } from "../src/store/editor";
import { dosSlice } from "../src/store/dos";
import { Emulators, CommandInterface } from "emulators";

declare const emulators: Emulators;

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

async function rejects(operation: Promise<unknown>, code: string) {
    try {
        await operation;
    } catch (error) {
        assert((error as { code: string }).code === code, "Expected " + code + ": " + String(error));
        return error as { revision: number; completed: string[] };
    }
    throw new Error("Expected rejection: " + code);
}

async function wait(condition: () => boolean, timeout = 30000) {
    const deadline = Date.now() + timeout;
    while (!condition()) {
        assert(Date.now() < deadline, "Timed out waiting for condition");
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
}

async function test() {
    const NativeAudioContext = window.AudioContext;
    const audioContexts: AudioContext[] = [];
    window.AudioContext = class extends NativeAudioContext {
        constructor(options?: AudioContextOptions) {
            super(options);
            audioContexts.push(this);
        }
    };
    const root = document.createElement("div");
    root.style.cssText = "height:600px;width:800px";
    document.body.append(root);
    const backend = new URLSearchParams(location.search).get("backend") === "dosboxX" ? "dosboxX" : "dosbox";
    let running: CommandInterface | null = null;
    let stdout = "";
    const earlyRoot = document.createElement("div");
    document.body.append(earlyRoot);
    const early = createDos(earlyRoot, { pathPrefix: new URL("/emulators/", location.href).href });
    await early.stop();
    assert(earlyRoot.childNodes.length === 0, "Early stop left a pending UI");
    const player = createDos(root, {
        pathPrefix: new URL("/emulators/", location.href).href,
        runInBackground: true,
        backend,
        workerThread: true,
        offscreenCanvas: false,
        renderBackend: "canvas",
        onEvent: (event, value) => {
            if (event === "ci-ready") {
                running = value;
                value.events().onStdout((text: string) => stdout += text);
            }
        },
    });
    await wait(() => player.editor.state().step === "emu-ready");
    const fixture = await emulators.bundle();
    fixture.dosboxConf = (await (await fetch("/fixture.conf")).text()).replace(/\r?\n/g, "\r\n");
    const bytes = await fixture.toUint8Array();
    await player.editor.open(bytes);
    await rejects(player.editor.files([{ path: "test.txt", delete: true }]), "not-ready");
    const original = player.editor.state();
    await rejects(player.editor.open(new Uint8Array([1, 2, 3])), "invalid-input");
    assert(player.editor.state().revision === original.revision, "Invalid input replaced the bundle");
    const config = { ...original.config!, dosboxConf: original.config!.dosboxConf + "\necho DRAFT_READY\n" };
    const overlapping = await Promise.allSettled([
        player.editor.setConfig(config, { expectedRevision: original.revision }),
        player.editor.setConfig(original.config!, { expectedRevision: original.revision }),
    ]);
    assert(overlapping[0].status === "fulfilled" && overlapping[1].status === "rejected",
        "Overlapping edits lost a revision");
    await rejects(player.editor.open(bytes), "conflict");
    const textareaConfig = config.dosboxConf.replace(/\r\n?/g, "\n");
    await wait(() => root.querySelector("textarea")?.value === textareaConfig);
    assert(root.querySelector("textarea")!.value === textareaConfig, "API edit is missing from Studio");
    const textarea = root.querySelector("textarea")!;
    textarea.value += "\necho UI_EDIT\n";
    const revision = player.editor.state().revision;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(() => player.editor.state().revision > revision);
    await rejects(player.editor.setConfig(config, { expectedRevision: revision }), "conflict");
    const beforeRun = await player.editor.snapshot();
    assert((await emulators.bundleConfig(beforeRun.bundle))!.dosboxConf.includes("UI_EDIT"),
        "Pre-run snapshot lost draft");
    await player.editor.start();
    console.log("editor: started", backend);
    await wait(() => running !== null);
    await wait(() => stdout.includes("MCP_READY"));
    await wait(() => audioContexts.some((context) => context.state === "suspended"));
    await wait(() => player.editor.state().audio !== "uninitialized");
    assert(["suspended", "backend-managed"].includes(player.editor.state().audio),
        "Audio state was not reported separately");
    assert(player.editor.state().error === null, "Autoplay blocking was reported as a game error");
    assert(running!.soundFrequency() === 0, "Native worklet audio was replaced by the legacy samples backend");
    const studioPause = running!.pause.bind(running);
    let studioPauseCount = 0;
    running!.pause = () => {
        studioPauseCount++; studioPause();
    };
    await new Promise((resolve) => setTimeout(resolve, 100));
    studioPauseCount = 0;
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert(studioPauseCount === 0, "Background-enabled Studio was paused when hidden");
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
    console.log("editor: stdout observed", backend);
    await player.editor.files([{ path: "RESULT.TXT", contents: new TextEncoder().encode("edited") }]);
    assert(new TextDecoder().decode(await player.editor.readFile("RESULT.TXT")) === "edited", "File write was lost");
    const originalCi = running;
    await player.editor.setConfig({ ...config, dosboxConf: config.dosboxConf + "\n# sockdrive draft warning\n" });
    await new Promise((resolve) => setTimeout(resolve, 200));
    assert(running === originalCi && player.editor.state().ready, "Draft configuration restarted the current backend");
    assert(new TextDecoder().decode(await player.editor.readFile("RESULT.TXT")) === "edited",
        "Draft backend selection discarded current files");
    assert((await player.editor.snapshot()).warnings.length > 0, "External resources were reported as autonomous");
    await player.editor.setConfig({ ...config, dosboxConf: config.dosboxConf + "\necho UNAPPLIED_DRAFT\n" });
    player.setPaused(true);
    console.log("editor: snapshot", backend);
    const exported = await player.editor.snapshot();
    assert(player.editor.state().paused, "Snapshot resumed a paused player");
    assert((await emulators.bundleConfig(exported.bundle))!.dosboxConf.includes("UNAPPLIED_DRAFT"),
        "Snapshot lost draft");
    const persisted = await running!.persist(true);
    console.log("editor: changes persisted", backend);
    assert(persisted instanceof Uint8Array, "Changes persistence regressed");
    await player.editor.open(exported.bundle, { discardChanges: true });
    console.log("editor: reopened", backend);
    await player.editor.setConfig({ ...config, dosboxConf: "[autoexec]\n@echo off\necho REOPENED\n" });
    player.setPaused(false);
    await player.editor.start();
    assert(new TextDecoder().decode(await player.editor.readFile("RESULT.TXT")) === "edited",
        "Reimport lost current file");
    await player.editor.restart();
    console.log("editor: restarted", backend);
    assert(player.editor.state().ready, "Restart did not wait for CI");
    await player.stop();
    await wait(() => audioContexts.every((context) => context.state === "closed"));
    const ordinaryRoot = document.createElement("div");
    document.body.append(ordinaryRoot);
    const fixtureUrl = URL.createObjectURL(new Blob([bytes as BlobPart]));
    let savedChanges: Uint8Array | null = null;
    let ordinaryCi: CommandInterface | null = null;
    const ordinary = createDos(ordinaryRoot, {
        url: fixtureUrl,
        pathPrefix: new URL("/emulators/", location.href).href,
        backend,
        workerThread: true,
        offscreenCanvas: false,
        fsChanges: { local: false, pull: async () => null, push: async (_key, changes) => {
            savedChanges = changes;
        } },
        onEvent: (event, value) => {
            if (event === "ci-ready") ordinaryCi = value;
        },
    });
    await wait(() => ordinary.editor.state().config !== null);
    await ordinary.editor.start();
    await wait(() => ordinaryCi !== null);
    const persist = ordinaryCi!.persist.bind(ordinaryCi);
    let onlyChanges: boolean | undefined;
    ordinaryCi!.persist = (changes) => {
        onlyChanges = changes; return persist(changes);
    };
    await ordinary.editor.files([{ path: "SAVE.TXT", contents: new TextEncoder().encode("save regression") }]);
    assert(await ordinary.save(), "Legacy save failed");
    assert(onlyChanges === true && savedChanges instanceof Uint8Array, "Legacy save no longer persists changes");
    const ordinaryPause = ordinaryCi!.pause.bind(ordinaryCi);
    let ordinaryPauseCount = 0;
    ordinaryCi!.pause = () => {
        ordinaryPauseCount++; ordinaryPause();
    };
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    await wait(() => ordinaryPauseCount > 0);
    const ordinaryExit = ordinaryCi!.exit.bind(ordinaryCi);
    let ordinaryExitCount = 0;
    ordinaryCi!.exit = () => {
        ordinaryExitCount++; return ordinaryExit();
    };
    await ordinary.stop();
    await wait(() => audioContexts.every((context) => context.state === "closed"));
    window.AudioContext = NativeAudioContext;
    assert(ordinaryExitCount === 1, "Concurrent stop and unmount exited CI more than once");
    assert(ordinaryRoot.childNodes.length === 0, "stop did not unmount the UI");
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    URL.revokeObjectURL(fixtureUrl);

    const nonSerializable = makeNonSerializableStore({ runInBackground: true });
    const store = makeStore(nonSerializable, {});
    const editor = getEditor(store);
    store.dispatch(editorSlice.actions.init(config));
    store.dispatch(dosSlice.actions.ci(true));
    let paused = false;
    nonSerializable.ci = {
        pause: () => paused = true,
        resume: () => paused = false,
        persist: async () => {
            throw new Error("injected persist failure");
        },
        fsWriteFile: async (file: string) => {
            if (file === "fail.txt") throw new Error("write failure");
        },
    } as unknown as CommandInterface;
    try {
        await editor.snapshot();
        throw new Error("Snapshot should fail");
    } catch (error) {
        assert((error as Error).message === "injected persist failure", "Unexpected snapshot failure");
        assert(!paused, "Failed snapshot left backend paused");
    }
    const partial = await rejects(editor.files([
        { path: "ok.txt", contents: new Uint8Array() },
        { path: "fail.txt", contents: new Uint8Array() },
    ]), "backend");
    assert(partial.completed.join() === "ok.txt" && partial.revision === editor.state().revision,
        "Partial failure lost its revision");
    await rejects(editor.files([{ path: "../escape", contents: new Uint8Array() }]), "invalid-input");
    return { backend, status: "passed" };
}

(window as any).tests = test().catch((error) => ({ status: "failed", error: String(error), stack: error.stack }));
