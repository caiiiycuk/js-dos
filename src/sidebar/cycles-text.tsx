import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";

export function CyclesText(props: {}) {
    const cycles = Math.round(useSelector((state: State) => state.dos.stats.cyclesPerMs) / 1000);
    const hightlight = useSelector((state: State) => state.ui.frame) === "stats";
    const dispatch = useDispatch();

    function onClick() {
        if (hightlight) {
            dispatch(uiSlice.actions.frameNone());
        } else {
            dispatch(uiSlice.actions.frameStats());
        }
    }

    return <div class={"cycles cursor-pointer " + (hightlight ? "highlight" : "")}
        onClick={onClick}>
        <span>{cycles === 0 ? "~" : cycles}</span><sup>KC</sup>
    </div>;
}
