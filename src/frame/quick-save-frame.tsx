import { useDispatch, useSelector } from "react-redux";
import { LockBadge } from "../components/lock";
import { nonSerializableStore } from "../non-serializable-store";
import { CloudSaveButton } from "../sidebar/cloud-save-button";
import { DisketteIcon } from "../sidebar/diskette-icon";
import { State } from "../store";
import { dispatchLoginAction } from "../store/ui";

export function QuickSaveFrame() {
    const premium = useSelector((state: State) => state.auth.account)?.premium;
    return <div class="quick-save-frame flex flex-col justify-center items-center -my-2">
        <CloudSaveButton />
        <SaveButton label={1} bgcolor="bg-primary" textcolor="text-primary-content" />
        <LoadButton label={1} bgcolor="bg-primary" />
        <SaveButton disabled={!premium} label={2} bgcolor="bg-secondary" textcolor="text-secondary-content" />
        <LoadButton disabled={!premium} label={2} bgcolor="bg-secondary" />
        <SaveButton disabled={!premium} label={3} bgcolor="bg-accent" textcolor="text-accent-content" />
        <LoadButton disabled={!premium} label={3} bgcolor="bg-accent" />
    </div>;
}

function SaveButton(props: {
    label: number,
    bgcolor: string,
    textcolor: string,
    disabled?: boolean,
}) {
    const account = useSelector((state: State) => state.auth.account);
    const dispatch = useDispatch();
    function onClick() {
        if (props.disabled === true) {
            dispatchLoginAction(account, dispatch);
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

        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="absolute bottom-1 w-3 h-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
    </div>;
}

function LoadButton(props: {
    label: number,
    bgcolor: string,
    disabled?: boolean,
}) {
    const account = useSelector((state: State) => state.auth.account);
    const dispatch = useDispatch();
    function onClick() {
        if (props.disabled === true) {
            dispatchLoginAction(account, dispatch);
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
        <DisketteIcon class="opacity-10"/>
        {props.disabled === true && <LockBadge />}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="absolute bottom-1 w-6 h-6 -scale-y-100">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
        </svg>
    </div>;
}
