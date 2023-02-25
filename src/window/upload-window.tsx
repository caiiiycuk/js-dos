import { useDispatch } from "react-redux";
import { dosSlice } from "../store/dos";
import { useT } from "../i18n";
import { loadBundleFromFile } from "../load";

const fileInput = document.createElement("input");
fileInput.type = "file";

export function UploadWindow() {
    const t = useT();
    return <div class="overflow-hidden flex-grow flex flex-col items-center justify-center px-8">
        <Upload />
        <div class="mt-4 text-center">{t("upload_file")}</div>
    </div>;
}

export function Upload() {
    const dispatch = useDispatch();

    function onFileChange() {
        fileInput.removeEventListener("change", onFileChange);

        if (fileInput.files === null || fileInput.files.length === 0) {
            return;
        }

        const file = fileInput.files[0];
        loadBundleFromFile(file, dispatch)
            .catch((e) => dispatch(dosSlice.actions.bndError(e.message)));
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
