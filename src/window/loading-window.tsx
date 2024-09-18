import { useSelector } from "react-redux";
import { formatSize, Loading } from "../components/loading";
import { useT } from "../i18n";
import { State } from "../store";

export function LoadingWindow() {
    const t = useT();
    const step = useSelector((state: State) => state.dos.step);
    const received = useSelector((state: State) => state.storage.recived);
    const total = useSelector((state: State) => state.storage.total);

    let head = t("loading");
    let message = "100%";

    switch (step) {
        case "bnd-load": {
            head = t("bundle_loading");
            if (received > 0) {
                message = `${formatSize(received)} / ${formatSize(total)}`;

                if (total > 0) {
                    message += ` (${Math.round(received * 1000 / total) / 10}%)`;
                }
            }
        } break;
        case "bnd-config": {
            head = t("bundle_config");
        }

        default: {
        }
    }

    return <div class="flex flex-col w-full h-full items-center justify-center">
        <Loading head={head} message={message} />
    </div>;
}
