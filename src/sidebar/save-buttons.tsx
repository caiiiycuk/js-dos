import { useDispatch, useSelector, useStore } from "react-redux";
import { DisketteIcon } from "./diskette-icon";
import { getState, State, useNonSerializableStore } from "../store";
import { useState } from "preact/hooks";
import { apiSave } from "../player-api";

export function SaveButtons() {
    const [showLoad, setShowLoad] = useState<boolean>(false);
    const dosboxX = useSelector((state: State) => state.dos.backend) === "dosboxX";
    return <div class="save-buttons flex flex-col justify-center items-center -my-2">
        <CloudSaveButton />
        { dosboxX && <SaveButton label="X" bgcolor="bg-primary"
            textcolor="text-primary-content" onClick={() => setShowLoad(true)} /> }
        { dosboxX && showLoad && <LoadButton label="X" bgcolor="bg-primary" /> }
    </div>;
}

function SaveButton(props: {
    label: number | string,
    bgcolor: string,
    textcolor: string,
    onClick: () => void,
}) {
    const nonSerializableStore = useNonSerializableStore();
    function onClick() {
        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        ci.sendBackendEvent({
            type: "wc-trigger-event",
            event: "hand_savestate",
        });

        props.onClick();
    }

    return <div class={"sidebar-button flex justify-center"}
        onClick={onClick}>
        <DisketteIcon />
        <div class={"text-badge " + props.textcolor + " " + props.bgcolor}>{props.label}</div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="absolute bottom-1 w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9
                18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25
                12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813
                2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09
                3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375
                0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18
                2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75
                 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567
                16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5
                18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394
                1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
    </div>;
}

function LoadButton(props: {
    label: number | string,
    bgcolor: string,
}) {
    const nonSerializableStore = useNonSerializableStore();
    function onClick() {
        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        ci.sendBackendEvent({
            type: "wc-trigger-event",
            event: "hand_loadstate",
        });
    }

    return <div class={"sidebar-button flex justify-center"}
        onClick={onClick}>
        <DisketteIcon class="opacity-10" />
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="absolute bottom-1 w-6 h-6 -scale-y-100">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
    </div>;
}


function CloudSaveButton(props: {
    class?: string,
}) {
    const [busy, setBusy] = useState<boolean>(false);
    const dispatch = useDispatch();
    const cloudSaves = useSelector((state: State) => state.ui.cloudSaves);
    const nonSerializableStore = useNonSerializableStore();
    const store = useStore();

    if (!cloudSaves ||
        nonSerializableStore.loadedBundle === null ||
        nonSerializableStore.loadedBundle.bundleChangesUrl === null) {
        return null;
    }

    function onClick() {
        if (busy) {
            return;
        }


        setBusy(true);
        apiSave(getState(store as any), nonSerializableStore, dispatch)
            .finally(() =>setBusy(false));
    }

    return <div class={"save-button sidebar-button overflow-hidden " +
        (busy ? " sidebar-highlight " : "") + props.class} onClick={onClick}>
        <div class="w-full h-full flex justify-center">
            <DisketteIcon />
            {busy && <div class="sidebar-badge" />}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor"
                class="absolute bottom-1 w-3 h-3">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775
                    5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
        </div>
    </div>;
}
