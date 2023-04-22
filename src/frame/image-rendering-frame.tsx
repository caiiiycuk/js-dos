import { ImageRenderingSelect, RenderAspectSelect } from "../components/dos-option-select";

export function ImageRenderingFrame(props: {}) {
    return <div class="image-rendering-frame frame-root items-start pl-4">
        <RenderAspectSelect multiline={true} />
        <ImageRenderingSelect multiline={true} />
    </div>;
}
