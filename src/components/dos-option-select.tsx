import { useDispatch, useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";
import { Select } from "./select";
import { AnyAction } from "@reduxjs/toolkit";
import { Backend, BackendValues, dosSlice, RenderAspect, RenderAspectValues,
    RenderBackend, RenderBackendValues } from "../store/dos";

export function BackendSelect() {
    return <DosOptionSelect
        label="emulation_backend"
        values={[...BackendValues]}
        selector={(state: State) => state.dos.backend}
        dispatch={(newValue: Backend) => dosSlice.actions.dosBackend(newValue)}
    />;
}

export function RenderSelect() {
    const disabled = useSelector((state: State) => state.ui.window) === "run";
    return <DosOptionSelect
        label="render_backend"
        values={[...RenderBackendValues]}
        disabled={disabled}
        selector={(state: State) => state.dos.renderBackend}
        dispatch={(newValue: RenderBackend) => dosSlice.actions.renderBackend(newValue)}
    />;
}

export function RenderAspectSelect() {
    return <DosOptionSelect
        label="render_aspect"
        values={[...RenderAspectValues]}
        selector={(state: State) => state.dos.renderAspect}
        dispatch={(newValue: RenderAspect) => dosSlice.actions.renderAspect(newValue)}
    />;
}

function DosOptionSelect<T>(props: {
    label: string,
    values: string[]
    selector: (state: State) => T,
    dispatch: (newValue: T) => AnyAction;
    disabled?: boolean,
}) {
    const t = useT();
    const value = useSelector(props.selector);
    const dispatch = useDispatch();

    function onBackend(newValue: T) {
        dispatch(props.dispatch(newValue));
    }
    return <Select
        class="mt-4"
        disabled={props.disabled === true}
        label={t(props.label)}
        selected={value as string}
        values={props.values}
        onSelect={onBackend as any} />;
}

