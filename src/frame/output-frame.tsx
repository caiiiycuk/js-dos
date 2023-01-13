import { RenderAspectSelect, RenderSelect } from "../components/dos-option-select";

export function OutputFrame(props: {}) {
    return <div class="frame-root items-start pl-4">
        <RenderSelect />
        <RenderAspectSelect />
    </div>;
}
