import { useDispatch, useSelector } from "react-redux";
import { dosSlice } from "../store/dos";
import { State, useNonSerializableStore } from "../store";
import { useT } from "../i18n";
import { uiSlice } from "../store/ui";
import { Emulators } from "emulators";

declare const emulators: Emulators;

export function PreRunWindow() {
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);

    return <div class="pre-run-window">
        <Play />
        <div class="text-center mt-8 absolute bottom-4">jsdos/emu version:&nbsp;
            <span class="text-ellipsis overflow-hidden">{JSDOS_VERSION}/{emuVersion}</span></div>
    </div>;
}

export function Play(props: { class?: string, button?: boolean }) {
    const configChanged = useSelector((state: State) => state.editor.configChanged);
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const frameVisible = useSelector((state: State) => state.ui.frame !== "none");
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();
    const t = useT();

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

    if (props.button === true) {
        return <div class="btn btn-accent w-full sm:hidden" onClick={onPlay}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>

            {t("play")}
        </div>;
    } else {
        return <div class={props.class + " relative cursor-pointer w-1/4 h-1/4 min-w-48 " +
            "min-h-48 max-w-96 max-h-96"} onClick={onPlay}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-full h-full play-button">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
            </svg>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class={ "w-10 h-10 absolute right-0 bottom-0 cursor-pointer" +
                    (frameVisible ? " sidebar-highlight" : "") }
                onClick={(e) => {
                    if (frameVisible) {
                        dispatch(uiSlice.actions.frameNone());
                    } else {
                        dispatch(uiSlice.actions.framePreRun());
                    }
                    e.stopPropagation();
                }}>
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55
                        0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257
                        1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26
                        1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010
                        .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298
                        2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0
                        01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55
                        0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0
                        01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0
                        01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932
                        6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0
                        01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072
                        1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>;
    }
}
