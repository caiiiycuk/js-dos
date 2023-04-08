import { useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Login } from "./login/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { uiSlice } from "./store/ui";
import { Window } from "./window/window";

let currentWideScreen = uiSlice.getInitialState().wideScreen;
export function Ui() {
    const rootRef = useRef<HTMLDivElement>(null);
    const theme = useSelector((state: State) => state.ui.theme);
    const dispatch = useDispatch();

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current;
        function onResize() {
            const size = root.getBoundingClientRect().width;
            const wide = size > 640;
            if (wide !== currentWideScreen) {
                currentWideScreen = wide;
                dispatch(uiSlice.actions.setWideScreen(currentWideScreen));
            }
        }

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(root);
        window.addEventListener("resize", onResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, [rootRef, dispatch]);

    return <div
        ref={rootRef}
        class="w-full h-full relative"
        data-theme={theme}>
        <Window />
        <Frame />
        <SideBar />
        <Login />
        <Toast />
    </div>;
};

function Toast() {
    const toast = useSelector((state: State) => state.ui.toast);
    const intent = useSelector((state: State) => state.ui.toastIntent);

    if (toast === null) {
        return null;
    }

    return <div class="absolute right-10 bottom-10">
        <div class={"alert alert-" + intent} >
            { toast }
        </div>
    </div>;
}
