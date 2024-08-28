import { useDispatch, useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";
import { Select } from "./select";
import { AnyAction } from "@reduxjs/toolkit";
import {
    Backend, BackendValues, dosSlice, ImageRendering, ImageRenderingValues, RenderAspect, RenderAspectValues,
    RenderBackend, RenderBackendValues,
} from "../store/dos";
import { ThemeValues, Theme, uiSlice } from "../store/ui";
import { lStorage } from "../host/lstorage";
import { SockdriveBackendName, initSlice, sockdriveBackendNames } from "../store/init";

export function BackendSelect(props: { multiline?: boolean }) {
    const locked = useSelector((state: State) => state.dos.backendLocked);
    return <OptionSelect
        multiline={props.multiline}
        label="emulation_backend"
        values={[...BackendValues]}
        disabled={locked}
        selector={(state: State) => state.dos.backend}
        dispatch={(newValue: Backend) => {
            lStorage.setItem("backend", newValue);
            return dosSlice.actions.dosBackend(newValue);
        }}
    />;
}

export function RenderSelect(props: { multiline?: boolean }) {
    const disabled = useSelector((state: State) => state.ui.window) === "run";
    return <OptionSelect
        multiline={props.multiline}
        label="render_backend"
        values={[...RenderBackendValues]}
        disabled={disabled}
        selector={(state: State) => state.dos.renderBackend}
        dispatch={(newValue: RenderBackend) => dosSlice.actions.renderBackend(newValue)}
    />;
}

export function RenderAspectSelect(props: { multiline?: boolean }) {
    return <OptionSelect
        label="render_aspect"
        multiline={props.multiline}
        values={[...RenderAspectValues]}
        selector={(state: State) => state.dos.renderAspect}
        dispatch={(newValue: RenderAspect) => dosSlice.actions.renderAspect(newValue)}
    />;
}

export function ImageRenderingSelect(props: { multiline?: boolean }) {
    return <OptionSelect
        label="image_rendering"
        multiline={props.multiline}
        values={[...ImageRenderingValues]}
        selector={(state: State) => state.dos.imageRendering}
        dispatch={(newValue: ImageRendering) => dosSlice.actions.imageRendering(newValue)}
    />;
}

export function ThemeSelect(props: { class?: string, multiline?: boolean }) {
    return <OptionSelect
        class={props.class}
        label="theme"
        values={[...ThemeValues]}
        selector={(state: State) => state.ui.theme}
        dispatch={(newValue: Theme) => uiSlice.actions.theme(newValue)}
        multiline={props.multiline}
    />;
}

export function SockdriveBackend(props: { class?: string, multiline?: boolean }) {
    return <OptionSelect<SockdriveBackendName>
        class={props.class}
        label="FAT16/32 Backend"
        values={sockdriveBackendNames}
        selector={(state: State) => state.init.sockdriveBackendName}
        dispatch={(newValue) => initSlice.actions.setSockdriveBackendName(newValue)}
        multiline={props.multiline}
    />;
}

function OptionSelect<T>(props: {
    class?: string,
    selectClass?: string,
    label: string,
    values: string[]
    selector: (state: State) => T,
    dispatch: (newValue: T) => AnyAction;
    disabled?: boolean,
    multiline?: boolean,
}) {
    const t = useT();
    const value = useSelector(props.selector);
    const dispatch = useDispatch();

    function onBackend(newValue: T) {
        dispatch(props.dispatch(newValue));
    }
    return <Select
        class={"mt-4 " + props.class}
        selectClass={props.selectClass}
        disabled={props.disabled}
        multiline={props.multiline}
        label={t(props.label)}
        selected={value as string}
        values={props.values}
        onSelect={onBackend as any} />;
}

