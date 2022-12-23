export function Select(props: {
    class?: string,
    label: string,
    selected: string,
    values: [string, string][],
}) {
    return <div class={props.class + " flex flex-row items-center"}>
        <div class="mr-4">{props.label}</div>
        <div>
            <select>
                <option value="webgl">WebGL</option>
                <option value="canvas">Canvas 2D</option>
            </select>
        </div>
    </div>;
}
