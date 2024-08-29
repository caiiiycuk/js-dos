import { useDispatch, useStore } from "react-redux";
import { dosSlice } from "../store/dos";
import { useT } from "../i18n";
import { loadBundleFromFile, loadBundleFromUrl, loadEmptyBundle } from "../player-api-load";
import { useState } from "preact/hooks";
import { uiSlice } from "../store/ui";
import { Store } from "../store";

const fileInput = document.createElement("input");
fileInput.type = "file";

export function SelectWindow() {
    const t = useT();
    const store = useStore() as Store;
    const [useUrl, setUseUrl] = useState<boolean>(false);

    if (useUrl) {
        return <div class="select-window overflow-hidden flex-grow flex flex-col items-center justify-center px-8 py-8">
            <Load />
        </div>;
    }

    async function createEmpty() {
        try {
            await loadEmptyBundle(store).catch(console.error);
        } catch (e: any) {
            store.dispatch(dosSlice.actions.bndError(e.message ?? "unexpected error"));
        }
    }

    return <div class="select-window overflow-hidden flex-grow flex flex-col items-center justify-center px-8">
        <div class="mb-4 text-center underline cursor-pointer hover:text-accent"
            onClick={() => setUseUrl(true)}>{t("load_by_url")}</div>
        <Upload />
        <div class="mt-4 text-center">{t("upload_file")}</div>
        <div class="mt-4 text-center underline cursor-pointer hover:text-accent"
            onClick={createEmpty}>{t("create_empty")}</div>
    </div>;
}

function Load() {
    const t = useT();
    const store = useStore();
    const dispatch = useDispatch();
    const [url, setUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    async function loadBundle(url: string) {
        dispatch(uiSlice.actions.frameNone());

        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e: any) {
            setError(e.message);
            return;
        }

        try {
            await loadBundleFromUrl(validUrl.toString(), store);
        } catch (e: any) {
            dispatch(dosSlice.actions.bndError(e.message ?? "unexpected error"));
        }
    }

    return <>
        <div class="form-control w-3/4 mb-4">
            <label class="label">
                <span class="label-text">{t("enter_url")}:</span>
            </label>
            <input type="text"
                class="input w-full input-sm input-bordered"
                onChange={(e) => setUrl(e.currentTarget.value ?? "")}
                value={url}></input>
        </div>
        <div class="mt-4 text-center underline cursor-pointer hover:text-accent"
            onClick={() => loadBundle(url)}>{t("load")}</div>
        {error !== null &&
            <div class="mt-8 text-center text-error">
                {error}
            </div>
        }
    </>;
}

function Upload() {
    const store = useStore() as Store;

    async function onFileChange() {
        fileInput.removeEventListener("change", onFileChange);

        if (fileInput.files === null || fileInput.files.length === 0) {
            return;
        }

        const file = fileInput.files[0];
        try {
            await loadBundleFromFile(file, store).catch((e) => store.dispatch(dosSlice.actions.bndError(e.message)));
        } catch (e: any) {
            store.dispatch(dosSlice.actions.bndError(e.message ?? "unexpected error"));
        }
    }

    function onUpload() {
        fileInput.addEventListener("change", onFileChange);
        fileInput.click();
    }

    return <div class="cursor-pointer" onClick={onUpload}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-48 h-48 play-button">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 13.5l3 3m0 0l3-3m-3
                3v-6m1.06-4.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25
                2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5
                1.5 0 01-1.06-.44z" />
        </svg>
    </div>;
}
