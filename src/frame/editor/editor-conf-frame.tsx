import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";
import { applySockdriveOptionsIfNeeded } from "../../player-api-load";

export function EditorConf() {
    const t = useT();
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const dispatch = useDispatch();

    function changeConfig(contents: string) {
        updateDosboxConf(contents);
    }

    function updateDosboxConf(newConf: string) {
        applySockdriveOptionsIfNeeded(newConf, dispatch);
        dispatch(dosSlice.actions.mouseCapture(newConf.indexOf("autolock=true") > 0));
        dispatch(editorSlice.actions.dosboxConf(newConf));
    }

    if (bundleConfig === null) {
        return null;
    }

    return <div class="editor-conf-frame flex flex-col flex-grow w-full gap-2">
        <div class="">{t("dosboxconf_template")}</div>
        <div class="flex flex-row flex-wrap items-center gap-2">
            {dosboxconf
                .map(({ name, backend, contents }) => {
                    return <button class="btn btn-sm"
                        onClick={() => {
                            dispatch(dosSlice.actions.dosBackend(backend === "dosboxX" ? "dosboxX" : "dosbox"));
                        }}>
                        {name}
                    </button>;
                })}
        </div>
        <textarea class="flex-grow" value={bundleConfig.dosboxConf}
            onChange={(e) => changeConfig(e.currentTarget?.value ?? "")} />
    </div>;
}
