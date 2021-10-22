
import { html } from "../dom";
import { Icons } from "../icons";
import { Props } from "../player-app";

interface ControlsProps extends Props {
    class?: string,
};

export function Controls(props: ControlsProps) {
    const toggleKeyboard = () => {
        props.toggleKeyboard();
        props.closeSideBar();
    };

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
        <div class="h-6 w-6 ${props.keyboard ? " text-green-400" : "" }" onClick=${toggleKeyboard}>
            <${Icons.PencilAlt} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6">
            <${Icons.Fullscreen} class="h-6 w-6" />
        </div>
    </div>
    `;
}
