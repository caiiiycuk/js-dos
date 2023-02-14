import { useSelector } from "react-redux";
import { Loading } from "../../components/loading";
import { useT } from "../../i18n";
import { State } from "../../store";

export function EditorLoading() {
    const t = useT();
    const step = useSelector((state: State) => state.editor.step);
    let head = t("loading");
    let message = "";

    switch (step) {
        case "extract": {
            head = t("extract_loading");
            message = t("extract_long_time");
        } break;
    }

    return <Loading head={head} message={message}/>;
}
