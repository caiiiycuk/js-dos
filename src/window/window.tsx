import { useSelector } from "react-redux";
import { State } from "../store";
import { ErrorWindow } from "./error-window";
import { LoadingWindow } from "./loading-window";

export function Window(props: {}) {
    const frameOpened = useSelector((state: State) => state.ui.frame) !== "none";
    const window = useSelector((state: State) => state.ui.window);
    let windowComponent = null;
    switch (window) {
        case "error": {
            windowComponent = <ErrorWindow />;
        } break;
        case "loading": {
            windowComponent = <LoadingWindow />;
        } break;
        default: ;
    };
    return <div class="absolute w-full h-full flex flex-row">
        <div class={ frameOpened ? "w-96" : "w-12" }></div>
        {windowComponent}
    </div>;
}
