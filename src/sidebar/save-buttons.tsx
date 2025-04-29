import { useDispatch, useSelector, useStore } from "react-redux";
import { DisketteIcon } from "./diskette-icon";
import { getState, State, useNonSerializableStore } from "../store";
import { useState } from "preact/hooks";
import { apiSave, sendQuickLoadEvent, sendQuickSaveEvent } from "../player-api";
import { uiSlice } from "../store/ui";

export function SaveButtons() {
    const showQuickLoad = useSelector((state: State) => state.ui.haveQuickSave);
    const dosboxX = useSelector((state: State) => state.dos.backend) === "dosboxX";
    return <div class="save-buttons flex flex-col justify-center items-center -my-2">
        <SaveButton />
        {dosboxX && <QuickSaveButton label="X" bgcolor="bg-primary" textcolor="text-primary-content" />}
        {dosboxX && showQuickLoad && <QuickLoadButton label="X" bgcolor="bg-primary" />}
    </div>;
}

function QuickSaveButton(props: {
    label: number | string,
    bgcolor: string,
    textcolor: string,
}) {
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();

    function onClick() {
        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        sendQuickSaveEvent(ci);
        dispatch(uiSlice.actions.setHaveQuickSave(true));
    }

    return <div class={"sidebar-button flex justify-center"}
        onClick={onClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="absolute left-0 bottom-0 w-6 h-6 opacity-30">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75
            7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621
            0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>

        <p class="absolute top-0 right-0 font-bold">F6</p>
    </div>;
}

function QuickLoadButton(props: {
    label: number | string,
    bgcolor: string,
}) {
    const nonSerializableStore = useNonSerializableStore();
    function onClick() {
        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        sendQuickLoadEvent(ci);
    }

    return <div class={"sidebar-button flex justify-center"}
        onClick={onClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="absolute left-0 bottom-0  w-6 h-6 -scale-y-100 opacity-30">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
        <p class="absolute top-0 right-0 font-bold">F7</p>
    </div>;
}


function SaveButton(props: {
    class?: string,
}) {
    const [busy, setBusy] = useState<boolean>(false);
    const dispatch = useDispatch();
    const canSave = useSelector((state: State) => state.ui.canSave);
    const nonSerializableStore = useNonSerializableStore();
    const store = useStore();

    if (!canSave ||
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
            .finally(() => setBusy(false));
    }

    return <div class={"save-button sidebar-button overflow-hidden " +
        (busy ? " sidebar-highlight " : "") + props.class} onClick={onClick}>
        <div class="w-full h-full flex justify-center">
            <DisketteIcon />
            {busy && <div class="sidebar-badge" />}
        </div>
    </div>;
}
