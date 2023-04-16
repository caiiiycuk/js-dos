import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";

export function NetworkButton(props: {
    class?: string,
}) {
    const hightlight = useSelector((state: State) => state.ui.frame) === "network";
    const inactive = useSelector((state: State) => state.dos.network.ipx !== "connected");
    const dispatch = useDispatch();

    function onClick() {
        if (hightlight) {
            dispatch(uiSlice.actions.frameNone());
        } else {
            dispatch(uiSlice.actions.frameNetwork());
        }
    }

    return <div class={"network-button sidebar-button " +
        (hightlight ? " sidebar-highlight " : "") +
        (inactive ? " inactive " : "") +
        props.class} onClick={onClick}>
        <div class="w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0
                 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565
                 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
            { inactive && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-full text-error h-full absolute top-0 left-0">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4L18 18" />
            </svg> }
        </div>


    </div >;
}
