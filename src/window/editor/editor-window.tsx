import { useSelector } from "react-redux";
import { Error } from "../../components/error";
import { State } from "../../store";
import { EditorConf } from "./editor-conf";
import { EditorLoading } from "./editor-loading";
import { EditorPreview } from "./editor-preview";

export function EditorWindow() {
    const step = useSelector((state: State) => state.editor.step);

    return <div class="editor-window">
        { step === "conf" && <EditorConf /> }
        { step === "preview" && <EditorPreview /> }
        { step === "error" && <Error /> }
        { (step === "extract" || step === "bundler") && <EditorLoading />}
    </div>;
}
