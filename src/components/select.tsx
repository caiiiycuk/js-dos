import { useT } from "../i18n";

export function Select(props: {
    class?: string,
    selectClass?: string,
    label: string,
    selected: string,
    values: string[],
    onSelect?: (value: string) => void,
    disabled?: boolean,
}) {
    const t = useT();
    function onSelect(e: any) {
        if (props.onSelect !== undefined) {
            props.onSelect(e.currentTarget.value);
        }
    }
    return <div class={props.class + " option flex flex-row items-center"}>
        <div class="mr-4">{props.label}</div>
        <div class="flex-grow">
            <select class={ props.selectClass ? props.selectClass : "w-28" }
                onChange={onSelect} disabled={props.disabled === true}>
                {props.values.map((v) => {
                    return <option selected={v === props.selected} value={v}>{t(v)}</option>;
                })}
            </select>
        </div>
    </div>;
}
