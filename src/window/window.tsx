import { useSelector } from "react-redux";
import { State } from "../store";
import { DosWindow } from "./dos/dos-window";
import { ErrorWindow } from "./error-window";
import { LoadingWindow } from "./loading-window";
import { PreRunWindow } from "./prerun-window";
import { SelectWindow } from "./select-window";

export function Window(props: {}) {
    const frameOpened = useSelector((state: State) => state.ui.frame) !== "none";
    const frameXs = useSelector((state: State) => state.ui.frameXs);
    const window = useSelector((state: State) => state.ui.window);
    let windowComponent = null;
    switch (window) {
        case "error": {
            windowComponent = <ErrorWindow />;
        } break;
        case "loading": {
            windowComponent = <LoadingWindow />;
        } break;
        case "prerun": {
            windowComponent = <PreRunWindow />;
        } break;
        case "run": {
            windowComponent = <DosWindow />;
        } break;
        case "select": {
            windowComponent = <SelectWindow />;
        } break;
        default: ;
    };
    return <div class="window absolute w-full h-full flex flex-row">
        <div class={(frameOpened ? (frameXs ? "w-24" : "w-96") : "w-12") + " flex-shrink-0"}></div>
        {windowComponent}
    </div>;
}
