import { useState } from "preact/hooks";
import { useDispatch, useSelector, useStore } from "react-redux";
import { State, useNonSerializableStore } from "../store";
import { DisketteIcon } from "./diskette-icon";
import { apiSave } from "../player-api";

export function CloudSaveButton(props: {
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
        apiSave(store.getState() as State, nonSerializableStore, dispatch)
            .finally(() =>setBusy(false));
    }

    return <div class={"save-button sidebar-button overflow-hidden " +
        (busy ? " sidebar-highlight " : "") + props.class} onClick={onClick}>
        <div class="w-full h-full flex justify-center">
            <DisketteIcon />
            {busy && <div class="sidebar-badge" />}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor"
                class="absolute bottom-1 w-3 h-3 text-primary-content">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775
                    5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
        </div>
    </div>;
}
