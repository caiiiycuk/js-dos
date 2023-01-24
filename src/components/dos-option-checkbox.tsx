import { useDispatch, useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";
import { dosSlice } from "../store/dos";
import { Checkbox } from "./checkbox";

export function PauseCheckbox() {
    const t = useT();
    const dispatch = useDispatch();
    const paused = useSelector((state: State) => state.dos.paused);
    const disabled = useSelector((state: State) => state.ui.window) !== "run";
    return <Checkbox
        class="mt-4"
        label={t("pause")}
        checked={paused}
        disabled={disabled}
        onChange={(p) => dispatch(dosSlice.actions.paused(p))}
    />;
}


export function WorkerCheckbox() {
    const t = useT();
    const dispatch = useDispatch();
    const worker = useSelector((state: State) => state.dos.worker);
    const disabled = useSelector((state: State) => state.ui.window) === "run";
    return <Checkbox
        class="mt-4"
        label={t("worker")}
        checked={worker}
        disabled={disabled}
        onChange={(w) => dispatch(dosSlice.actions.dosWorker(w))}
    />;
}
