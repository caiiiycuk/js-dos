import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";

export function EditorConf() {
    const t = useT();
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const dispatch = useDispatch();

    function onChange(e: any) {
        const contents = e.currentTarget?.value ?? "";
        updateDosboxConf(contents);
    }

    function updateDosboxConf(newConf: string) {
        dispatch(dosSlice.actions.mouseCapture(newConf.indexOf("autolock=true") > 0));
        dispatch(editorSlice.actions.dosboxConf(newConf));
    }

    if (bundleConfig === null) {
        return null;
    }

    return <div class="editor-conf-frame flex flex-col flex-grow w-full py-4">
        <div class="mr-4 self-start mb-4">{t("dosboxconf_template")}</div>
        <div class="flex flex-row flex-wrap items-center mb-4">
            {dosboxconf.map(({ name, backend, contents }) => {
                return <button class="btn btn-sm mx-2 mb-2"
                    onClick={() => {
                        dispatch(dosSlice.actions.dosBackend(backend === "dosboxX" ? "dosboxX" : "dosbox"));
                        updateDosboxConf(contents);
                    }}>
                    {name}
                </button>;
            })}
        </div>
        <textarea class="flex-grow" value={bundleConfig.dosboxConf} onChange={onChange} />
    </div>;
}
