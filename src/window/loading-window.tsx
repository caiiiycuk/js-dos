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
            // TODO: normal format
            message = `${received} / ${total} (${received * 100 / total}%)`;
        } break;
    }

    return <div class="flex-grow flex flex-col items-center justify-center frame-color">
        <div class="text-2xl">{head}</div>
        <div class="mt-2">{message}</div>
    </div>;
}
