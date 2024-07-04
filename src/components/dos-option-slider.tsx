import { useDispatch, useSelector } from "react-redux";
import { useT } from "../i18n";
import { dosSlice } from "../store/dos";
import { Slider } from "./slider";
import { State } from "../store";

export function MouseSensitiviySlider(props: {
    class?: string,
}) {
    const t = useT();
    const sensitivity = useSelector((state: State) => state.dos.mouseSensitivity);
    const dispatch = useDispatch();

    return <Slider
        class={props.class}
        label={t("mouse_sensitivity")}
        value={sensitivity}
        onChange={(value) => dispatch(dosSlice.actions.mouseSensitivity(value)) }
    />;
}

export function ScaleControlsSlider(props: {
    class?: string,
}) {
    const t = useT();
    const sensitivity = useSelector((state: State) => state.dos.scaleControls);
    const dispatch = useDispatch();

    return <Slider
        class={props.class}
        label={t("scale_controls")}
        value={sensitivity}
        onChange={(value) => dispatch(dosSlice.actions.scaleControls(value)) }
    />;
}

export function VolumeSlider(props: {
    class?: string,
}) {
    const t = useT();
    const volume = useSelector((state: State) => state.dos.volume);
    const dispatch = useDispatch();

    return <Slider
        class={props.class}
        label={t("volume")}
        value={volume}
        onChange={(value) => dispatch(dosSlice.actions.volume(value)) }
    />;
}
