import { useEffect, useRef } from "preact/hooks";

export function Checkbox(props: {
    class?: string,
    toggleClass?: string,
    label: string,
    checked?: boolean,
    onChange?: (value: boolean) => void,
    disabled?: boolean,
    intermediate?: boolean,
}) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref === null || ref.current === null) {
            return;
        }

        (ref.current as any).indeterminate = props.intermediate;
    }, [ref, props.intermediate]);

    function onChange() {
        if (props.onChange) {
            props.onChange(!(props.checked === true));
        }
    }

    return <div className={props.class + " form-control option"}
        onClick={onChange}>
        <label className="label cursor-pointer">
            <span className="label-text mr-6">{props.label}</span>
            <input
                ref={ref}
                checked={props.checked === true}
                type="checkbox"
                className={ "toggle " + (props.checked ? " toggle-primary " : "") +
                    props.toggleClass }
                disabled={props.disabled === true} />
        </label>
    </div>;
}
