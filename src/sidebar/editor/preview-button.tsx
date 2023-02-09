import { useDispatch, useSelector } from "react-redux";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";

export function PreviewButton(props: { class?: string }) {
    const hightlight = useSelector((state: State) => state.ui.window === "editor" &&
        state.editor.step === "preview");
    const dispatch = useDispatch();
    function openPreview() {
        dispatch(editorSlice.actions.stepPreview());
    }
    return <div class={"sidebar-button " + (hightlight ? "sidebar-highlight " : "") + props.class}
        onClick={openPreview}>
        <svg xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0
                01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
    </div>;
}
