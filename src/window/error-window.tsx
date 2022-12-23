import { useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";

export function ErrorWindow() {
    const t = useT();
    const error = useSelector((state: State) => state.dos.error) ?? "Unexpected error";

    return <div class="flex-grow flex flex-col items-center justify-center frame-color px-8">
        <div class="text-2xl text-center">{t("error")}</div>
        <div class="text-red-400 mt-8 text-2xl text-center">"{error}"</div>
        <div class="mt-8 text-sm text-center">{t("consult_logs")}</div>
    </div>;
}
