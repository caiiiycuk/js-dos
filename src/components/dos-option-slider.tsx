import { useDispatch, useSelector } from "react-redux";
import { useT } from "../i18n";
import { dosSlice } from "../store/dos";
import { Slider } from "./slider";
import { State } from "../store";

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
