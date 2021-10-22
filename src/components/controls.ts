
import { html } from "../dom";
import { Icons } from "../icons";

export function Controls(props: { class?: string }) {
    return html`
    <div class="flex flex-row justify-evenly ${props.class}">
        <div class="h-6 w-6">
            <${Icons.Mobile} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6">
            <${Icons.Pause} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6">
            <${Icons.VolumeUp} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6">
            <${Icons.PencilAlt} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6">
            <${Icons.Fullscreen} class="h-6 w-6" />
        </div>
    </div>
    `;
}
