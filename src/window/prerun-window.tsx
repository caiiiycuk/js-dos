import { useDispatch, useSelector } from "react-redux";
import { BackendSelect, RenderAspectSelect, RenderSelect } from "../components/dos-option-select";
import { dosSlice } from "../store/dos";
import { State } from "../store";
import { MouseCapture, WorkerCheckbox } from "../components/dos-option-checkbox";
import { MouseSensitiviySlider, VolumeSlider } from "../components/dos-option-slider";
import { updateBundleConf } from "../load";
import { useT } from "../i18n";
import { uiSlice } from "../store/ui";

export function PreRunWindow() {
    const account = useSelector((state: State) => state.auth.account);
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);
    const dispatch = useDispatch();
    const t = useT();

    function login() {
        if (account === null) {
            dispatch(uiSlice.actions.modalLogin());
        } else {
            dispatch(uiSlice.actions.frameAccount());
        }
    }

    return <div class="pre-run-window">
        <Play class="mb-8" />

        {(account === null || !account.premium) &&
            <div>
                <div
                    class="alert alert-success shadow-lg mb-4 -mt-4 underline cursor-pointer"
                    onClick={login}>
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg"
                            fill="red"
                            viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor"
                            class="stroke-current flex-shrink-0 h-6 w-6">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597
                                    1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75
                                    3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span>{t("not_premium")}</span>
                    </div>
                </div>
            </div>
        }

        <div class="flex flex-row flex-wrap justify-end">
            <div class="flex flex-col items-end">
                <BackendSelect />
                <RenderSelect />
            </div>
            <div class="ml-10 flex flex-col items-end">
                <WorkerCheckbox />
                <RenderAspectSelect />
                <MouseCapture />
            </div>
        </div>

        <MouseSensitiviySlider class="mt-4 w-full max-w-sm" />
        <VolumeSlider class="w-full max-w-sm" />

        <div class="text-center mt-8">emu-version: <span class="text-ellipsis overflow-hidden">{emuVersion}</span></div>
    </div>;
}

function Play(props: { class?: string }) {
    const configChanged = useSelector((state: State) => state.editor.configChanged);
    const dispatch = useDispatch();
    function onPlay() {
        if (configChanged) {
            updateBundleConf()
                .then(() => dispatch(dosSlice.actions.bndPlay()))
                .catch((e) => dispatch(dosSlice.actions.bndError(e.message ?? "unexpected error")));
        } else {
            dispatch(dosSlice.actions.bndPlay());
        }
    }

    return <div class={props.class + " cursor-pointer"} onClick={onPlay}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-48 h-48 play-button">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
    </div>;
}
