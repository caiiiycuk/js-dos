import { useDispatch, useSelector } from "react-redux";
import { BackendSelect, RenderAspectSelect, RenderSelect } from "../components/dos-option-select";
import { dosSlice } from "../store/dos";
import { State, useNonSerializableStore } from "../store";
import { HardwareCheckbox, MouseCapture, SockdriveWrite, WorkerCheckbox } from "../components/dos-option-checkbox";
import { MouseSensitiviySlider, ScaleControlsSlider, VolumeSlider } from "../components/dos-option-slider";
import { useT } from "../i18n";
import { dispatchLoginAction } from "../store/ui";
import { Emulators } from "emulators";

declare const emulators: Emulators;

export function PreRunWindow() {
    const account = useSelector((state: State) => state.auth.account);
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);
    const dispatch = useDispatch();
    const kiosk = useSelector((state: State) => state.ui.kiosk);
    const t = useT();

    function login() {
        dispatchLoginAction(account, dispatch);
    }

    function openPremiumPage() {
        window.open("https://js-dos.com/cloud-overview.html", "_blank");
    }

    return <div class="pre-run-window">
        <Play class="mb-8" />

        {!kiosk && (account === null) &&
            <div class="flex flex-row mb-4 -mt-4 items-center">
                <div class="btn btn-accent" onClick={login}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25
                             0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786
                             0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>

                    {t("please_login")}
                </div>
                <div class="ml-2 cursor-pointer" onClick={openPremiumPage}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025
                                 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45
                                 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                </div>
            </div>
        }
        {!kiosk && account &&
            <div class="flex flex-row mb-4 -mt-4 items-center">
                <div class="btn btn-ghost" onClick={login}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                        <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25
                             0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786
                             0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                    </svg>

                    {account.name ?? account.email}
                </div>
            </div>
        }

        <div class="flex flex-row flex-wrap justify-end">
            <div class="flex flex-col items-end">
                <BackendSelect />
                <RenderSelect />
                <SockdriveWrite />
            </div>
            <div class="ml-10 flex flex-col items-end">
                <HardwareCheckbox />
                <WorkerCheckbox />
                <RenderAspectSelect />
                <MouseCapture />
            </div>
        </div>

        <MouseSensitiviySlider class="mt-4 w-full max-w-sm" />
        <ScaleControlsSlider class="w-full max-w-sm" />
        <VolumeSlider class="w-full max-w-sm" />

        <div class="text-center mt-8">jsdos/emu version:&nbsp;
            <span class="text-ellipsis overflow-hidden">{JSDOS_VERSION}/{emuVersion}</span></div>
    </div>;
}

function Play(props: { class?: string }) {
    const configChanged = useSelector((state: State) => state.editor.configChanged);
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();

    async function onPlay() {
        if (configChanged) {
            const config = bundleConfig;
            const bundle = nonSerializableStore.loadedBundle?.bundle;
            if (bundle === null || config === null || !ArrayBuffer.isView(bundle)) {
                throw new Error("Unexpected behaviour (internal state is broken), bundle is null");
            }

            try {
                nonSerializableStore.loadedBundle!.bundle =
                    await emulators.bundleUpdateConfig(bundle, config);
                dispatch(dosSlice.actions.bndPlay({}));
            } catch (e) {
                dispatch(dosSlice.actions.bndError((e as Error).message ?? "unexpected error"));
            }
        } else {
            dispatch(dosSlice.actions.bndPlay({}));
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
