import { KeymapWASD, KeymapWASDQE } from "../components/dos-option-checkbox";

export function KeyMapFrame(props: {}) {
    return <div class="keymap-frame frame-root items-start pl-4">
        <h3 class="text-lg font-bold">Keyboard Mapping</h3>
        <KeymapWASD />
        <KeymapWASDQE />
        <div class="divider" />
    </div>;
}