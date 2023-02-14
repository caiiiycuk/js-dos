import { useDispatch, useSelector } from "react-redux";
import { Error } from "../../components/error";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";

export function EditorError() {
    const error = useSelector((state: State) => state.editor.errorMessage);
    const dispatch = useDispatch();

    function skipError() {
        dispatch(editorSlice.actions.stepConf());
    }

    return <Error error={error} onSkip={skipError} />;
}
