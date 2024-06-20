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
    const background = useSelector((state: State) => state.ui.background);
    const kiosk = useSelector((state: State) => state.ui.kiosk);

    let windowComponent = <Loading />;
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

    return <div class="window absolute w-full h-full bg-base-100">
        <div class="background-image"
            style={{ backgroundImage: (background ? "url(" + background + ")" : undefined ) }} />
        <div class="relative flex flex-row h-full w-full items-start justify-start overflow-auto">
            { !kiosk && <div class={(frameOpened ? (frameXs ? "w-24" : "w-96") : "w-12") + " flex-shrink-0"}></div> }
            {windowComponent}
        </div>
    </div>;
}

function Loading() {
    return <div class="w-full h-full flex justify-center items-center">
        <div class="radial-progress animate-spin" style="--value:70;"></div>
    </div>;
}
