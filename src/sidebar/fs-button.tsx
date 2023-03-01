import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";

export function FsButton(props: {
    class?: string,
}) {
    const hightlight = useSelector((state: State) => state.ui.frame) === "editor-fs";
    const dispatch = useDispatch();

    function onClick() {
        if (hightlight) {
            dispatch(uiSlice.actions.frameNone());
        } else {
            dispatch(uiSlice.actions.frameFs());
        }
    }

    return <div class={"sidebar-button " + (hightlight ? "sidebar-highlight " : "") +
        props.class} onClick={onClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5
                0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375
                3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3
                0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5
                0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
        </svg>
    </div>;
}
