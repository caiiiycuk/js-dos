import { Dispatch } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { nonSerializableStore } from "../non-serializable-store";
import { State } from "../store";
import { uiSlice } from "../store/ui";

export function FullscreenButton(props: {
    class?: string,
}) {
    const fullScreen = useSelector((state: State) => state.ui.fullScreen);
    const dispatch = useDispatch();

    function onClick() {
        setFullscreen(!fullScreen, dispatch);
    }

    return <div class={"fullscreen-button sidebar-button " +
        (fullScreen ? " sidebar-highlight " : "") +
        props.class} onClick={onClick}>
        <div class="w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0
                 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565
                 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
        </div>
    </div >;
}
function setFullscreen(fullScreen: boolean, dispatch: Dispatch) {
    const root = nonSerializableStore.root as any;
    if (fullScreen) {
        if (root.requestFullscreen) {
            root.requestFullscreen();
        } else if (root.webkitRequestFullscreen) {
            root.webkitRequestFullscreen();
        } else if (root.mozRequestFullScreen) {
            root.mozRequestFullScreen();
        } else if (root.msRequestFullscreen) {
            root.msRequestFullscreen();
        } else if (root.webkitEnterFullscreen) {
            root.webkitEnterFullscreen();
        } else {
            root.classList.add("jsdos-fullscreen-workaround");
        }
    } else {
        if (root.classList.contains("jsdos-fullscreen-workaround")) {
            root.classList.remove("jsdos-fullscreen-workaround");
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
    }

    dispatch(uiSlice.actions.setFullScreen(fullScreen));
}
