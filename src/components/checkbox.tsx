export function Checkbox(props: {
    class?: string,
    label: string,
    checked?: boolean,
    onChange?: (value: boolean) => void,
    disabled?: boolean,
}) {
    function onChange() {
        if (props.onChange) {
            props.onChange(!(props.checked === true));
        }
    }
    return <div
        class={props.class + " option flex flex-row items-center cursor-pointer"}
        onClick={onChange}>
        <div class="mr-4">{props.label}</div>
        <div class="pointer-events-none">
            <input class="w-28"
                checked={props.checked === true}
                type="checkbox"
                disabled={props.disabled === true} />
        </div>
    </div>;
}
