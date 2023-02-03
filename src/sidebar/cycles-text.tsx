import { useSelector } from "react-redux";
import { State } from "../store";

export function CyclesText(props: {}) {
    const cycles = Math.round(useSelector((state: State) => state.dos.stats.cyclesPerMs) / 1000);
    return <div class="cycles">
        <span>{cycles === 0 ? "~" : cycles}</span><sup>KC</sup>
    </div>;
}
