import { useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";

export function LoadingWindow() {
    const t = useT();
    const step = useSelector((state: State) => state.dos.step);
    const [received, total] = useSelector((state: State) =>
        [state.storage.recived, state.storage.total]);

    let head = "Loading";
    let message = "";

    switch (step) {
        case "bnd-load": {
            head = t("bundle_loading");
            message = `${formatSize(received)} / ${formatSize(total)}`;

            if (total > 0) {
                message += ` (${received * 100 / total}%)`;
            }
        } break;
        case "bnd-config": {
            head = t("bundle_config");
        }
    }

    return <div class="flex-grow flex flex-col items-center justify-center frame-color px-8">
        <div class="text-2xl text-center">{head}</div>
        <div class="mt-2 text-center">{message}</div>
    </div>;
}

function formatSize(size: number) {
    if (size < 1024) {
        return size + "b";
    }

    size /= 1024;

    if (size < 1024) {
        return Math.round(size) + "kb";
    }

    size /= 1024;
    return Math.round(size * 10) / 10 + "mb";
}
