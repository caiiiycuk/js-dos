import { useT } from "../i18n";

export function Error(props: {
    error?: string | null,
    onSkip?: () => void,
}) {
    const t = useT();
    const error = props.error ?? "Unexpected error";

    return <div class="flex-grow flex flex-col items-center justify-center px-8 m-auto">
        <div class="text-2xl text-center">{t("error")}</div>
        <div class="text-red-400 mt-8 text-2xl text-center">"{error}"</div>
        <div class="mt-8 text-sm text-center">{t("consult_logs")}</div>
        { props.onSkip && <button class="mt-8 btn-primary" onClick={props.onSkip}>{t("skip")}</button> }
    </div>;
}
