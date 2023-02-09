import { useSelector } from "react-redux";
import { State } from "../../store";
import { EditorConf } from "./editor-conf";
import { EditorPreview } from "./editor-preview";

export function EditorWindow() {
    const step = useSelector((state: State) => state.editor.step);
    return <div class="editor-window">
        { step === "conf" && <EditorConf /> }
        { step === "preview" && <EditorPreview /> }
    </div>;
}
