import { useSelector } from "react-redux";
import { useT } from "../i18n";
import { State } from "../store";

export function ErrorWindow() {
    const t = useT();
    const error = useSelector((state: State) => state.dos.error) ?? "Unexpected error";

    return <div class="flex-grow flex flex-col items-center justify-center frame-color">
        <div class="text-2xl text-center">{t("error")}</div>
        <div class="mt-8 text-2xl">"{error}"</div>
        <div class="mt-8 text-sm">{t("consult_logs")}</div>
    </div>;
}
