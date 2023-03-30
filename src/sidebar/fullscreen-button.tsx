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
        <div class={"w-full h-full" +
            (fullScreen ? " scale-125 hover:scale-100" : "scale-100 hover:scale-125")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-full h-full">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75
                6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9
                0H6A2.25 2.25 0 013.75 18v-1.5M15 0z" />
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
