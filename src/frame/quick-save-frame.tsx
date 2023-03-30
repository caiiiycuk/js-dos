import { useDispatch, useSelector } from "react-redux";
import { LockBadge } from "../components/lock";
import { nonSerializableStore } from "../non-serializable-store";
import { CloudSaveButton } from "../sidebar/cloud-save-button";
import { DisketteIcon } from "../sidebar/diskette-icon";
import { State } from "../store";
import { uiSlice } from "../store/ui";

export function QuickSaveFrame() {
    const premium = useSelector((state: State) => state.auth.account)?.premium;
    return <div class="quick-save-frame flex flex-col justify-center items-center -my-2">
        <CloudSaveButton />
        <SaveButton label={1} bgcolor="bg-primary" textcolor="text-primary-content" />
        <LoadButton label={1} bgcolor="bg-primary" textcolor="text-primary-content" />
        <SaveButton disabled={!premium} label={2} bgcolor="bg-secondary" textcolor="text-secondary-content" />
        <LoadButton disabled={!premium} label={2} bgcolor="bg-secondary" textcolor="text-secondary-content" />
        <SaveButton disabled={!premium} label={3} bgcolor="bg-accent" textcolor="text-accent-content" />
        <LoadButton disabled={!premium} label={3} bgcolor="bg-accent" textcolor="text-accent-content" />
    </div>;
}

function SaveButton(props: {
    label: number,
    bgcolor: string,
    textcolor: string,
    disabled?: boolean,
}) {
    const dispatch = useDispatch();
    function onClick() {
        if (props.disabled === true) {
            dispatch(uiSlice.actions.frameAccount());
        }

        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        ci.sendBackendEvent({
            type: "wc-trigger-event",
            event: "hand_savestate",
        });
    }

    return <div class={"sidebar-button flex justify-center " + (props.disabled ? "opacity-50" : "")}
        onClick={onClick}>
        <DisketteIcon />
        {props.disabled !== true &&
            <div class={"text-badge " + props.textcolor + " " + props.bgcolor}>{props.label}</div>}
        {props.disabled === true && <LockBadge />}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="currentColor" class={"absolute bottom-1 w-3 h-3 rotate-90 " +
                props.textcolor} >
            <path d="M12 1.5a.75.75 0 01.75.75V7.5h-1.5V2.25A.75.75 0 0112 1.5zM11.25
                7.5v5.69l-1.72-1.72a.75.75 0 00-1.06 1.06l3 3a.75.75 0 001.06 0l3-3a.75.75
                0 10-1.06-1.06l-1.72 1.72V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3
                0 01-3-3v-9a3 3 0 013-3h3.75z" />
        </svg>

    </div>;
}

function LoadButton(props: {
    label: number,
    bgcolor: string,
    textcolor: string,
    disabled?: boolean,
}) {
    const dispatch = useDispatch();
    function onClick() {
        if (props.disabled === true) {
            dispatch(uiSlice.actions.frameAccount());
        }

        const ci = nonSerializableStore.ci;
        if (ci === null) {
            return;
        }

        ci.sendBackendEvent({
            type: "wc-trigger-event",
            event: "hand_loadstate",
        });
    }

    return <div class={"sidebar-button flex justify-center " + (props.disabled ? " opacity-50" : "")}
        onClick={onClick}>
        <DisketteIcon />
        {props.disabled !== true &&
            <div class={"text-badge " + props.textcolor + " " + props.bgcolor}>{props.label}</div>}
        {props.disabled === true && <LockBadge />}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="currentColor" class={"absolute bottom-1 w-3 h-3 rotate-90 " +
                props.textcolor}>
            <path d="M11.47 1.72a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06
                1.06l-1.72-1.72V7.5h-1.5V4.06L9.53 5.78a.75.75 0
                01-1.06-1.06l3-3zM11.25 7.5V15a.75.75 0 001.5
                0V7.5h3.75a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3
                0 01-3-3v-9a3 3 0 013-3h3.75z" />
        </svg>

    </div>;
}
