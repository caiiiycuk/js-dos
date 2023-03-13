import { useSelector } from "react-redux";
import { formatSize, Loading } from "../components/loading";
import { useT } from "../i18n";
import { State } from "../store";

export function LoadingWindow() {
    const t = useT();
    const step = useSelector((state: State) => state.dos.step);
    const [received, total] = useSelector((state: State) =>
        [state.storage.recived, state.storage.total]);

    let head = t("loading");
    let message = "";

    switch (step) {
        case "bnd-load": {
            head = t("bundle_loading");
            message = `${formatSize(received)} / ${formatSize(total)}`;

            if (total > 0) {
                message += ` (${Math.round(received * 10 / total) / 10}%)`;
            }
        } break;
        case "bnd-config": {
            head = t("bundle_config");
        }

        default: {
        }
    }

    return <Loading head={head} message={message} />;
}
