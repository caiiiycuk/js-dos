export function Checkbox(props: {
    class?: string,
    label: string,
    checked?: boolean,
    onChange?: (value: boolean) => void,
    disabled?: boolean,
}) {
    function onChange(e: any) {
        if (props.onChange !== undefined) {
            props.onChange(e.currentTarget.value === true);
        }
    }
    return <div class={props.class + " option flex flex-row items-center"}>
        <div class="mr-4">{props.label}</div>
        <div>
            <input class="w-28"
                checked={props.checked === true}
                type="checkbox"
                disabled={props.disabled === true}
                onChange={onChange} />
        </div>
    </div>;
}
