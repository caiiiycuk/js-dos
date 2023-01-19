import { RenderAspectSelect, RenderSelect } from "../components/dos-option-select";

export function OutputFrame(props: {}) {
    return <div class="output-frame frame-root items-start pl-4">
        <RenderSelect />
        <RenderAspectSelect />
    </div>;
}
