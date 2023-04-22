import { useT } from "../i18n";

export function Select(props: {
    class?: string,
    selectClass?: string,
    label: string,
    selected: string,
    values: string[],
    onSelect?: (value: string) => void,
    disabled?: boolean,
    multiline?: boolean,
}) {
    const t = useT();
    const multiline = props.multiline === true;
    function onSelect(e: any) {
        if (props.onSelect !== undefined) {
            props.onSelect(e.currentTarget.value);
        }
    }
    return <div class={props.class + " option flex " +
        (multiline ? "flex-col" : "flex-row items-center")}>
        <div class={ multiline ? "mb-2" : "mr-4" }>{props.label}</div>
        <div class="flex-grow">
            <select class={ props.selectClass ? props.selectClass :
                (multiline ? "w-full" : "w-28") }
            onChange={onSelect} disabled={props.disabled === true}>
                {props.values.map((v) => {
                    return <option selected={v === props.selected} value={v}>{t(v)}</option>;
                })}
            </select>
        </div>
    </div>;
}
