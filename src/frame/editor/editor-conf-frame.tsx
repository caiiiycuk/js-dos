import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";

export function EditorConf() {
    const t = useT();
    const conf = useSelector((state: State) => state.editor.dosboxconf);
    const dispatch = useDispatch();

    function onChange(e: any) {
        const contents = e.currentTarget?.value ?? "";
        dispatch(editorSlice.actions.dosboxConf(contents));
    }

    return <div class="editor-conf flex flex-col flex-grow w-full py-4">
        <div class="flex flex-row items-center mb-4">
            <div class="mr-4">{t("dosboxconf_template")}</div>
            { dosboxconf.map(({ name, contents }) => {
                return <button
                    onClick={() => {
                        dispatch(editorSlice.actions.dosboxConf(contents));
                    }}>
                    {name}
                </button>;
            })}
        </div>
        <textarea class="flex-grow" value={conf} onChange={onChange} />
    </div>;
}
