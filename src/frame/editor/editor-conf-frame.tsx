import { useDispatch, useSelector, useStore } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";
import { getEditor } from "../../player-editor";
import { uiSlice } from "../../store/ui";

export function EditorConf() {
    const t = useT();
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const dispatch = useDispatch();
    const store = useStore();

    function changeConfig(contents: string) {
        updateDosboxConf(contents);
    }

    function updateDosboxConf(newConf: string) {
        const state = getEditor(store).state();
        if (state.config) {
            getEditor(store).setConfig({ ...state.config, dosboxConf: newConf }, { expectedRevision: state.revision })
                .catch((error) => dispatch(uiSlice.actions.showToast({ message: error.message, intent: "error" })));
        }
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
