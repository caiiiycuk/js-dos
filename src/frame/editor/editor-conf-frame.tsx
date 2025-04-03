import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";
import { useEffect, useState } from "preact/hooks";
import { sockdriveBackend } from "../../store/init";
import { uiSlice } from "../../store/ui";
import { applySockdriveOptionsIfNeeded } from "../../player-api-load";

export function EditorConf() {
    const t = useT();
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const account = useSelector((state: State) => state.auth.account);
    const backend = useSelector((state: State) => state.dos.backend);
    const { sockdriveEndpoint, sockdriveWssEndpoint } = useSelector((state: State) =>
        sockdriveBackend[state.init.sockdriveBackendName] ??
        sockdriveBackend["js-dos"]);
    const dispatch = useDispatch();
    const [myDrives, setMyDrives] = useState<{ name: string, owner: string }[]>([]);

    useEffect(() => {
        if (!account) {
            setMyDrives([]);
        } else {
            fetch(sockdriveEndpoint + "/list/drives/" + account.token)
                .then((r) => r.json())
                .then(setMyDrives)
                .catch(console.error);
        }
    }, [account?.token, sockdriveEndpoint]);

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
                            changeConfig(contents.replaceAll("{wss-makevm}", sockdriveWssEndpoint));
                        }}>
                        {name}
                    </button>;
                })}
        </div>
        <textarea class="flex-grow" value={bundleConfig.dosboxConf}
            onChange={(e) => changeConfig(e.currentTarget?.value ?? "")} />
    </div>;
}
