
import { html } from "../dom";
import { Icons } from "../icons";
import { Props } from "../player-app";

interface ControlsProps extends Props {
    class?: string,
    column?: boolean,
};

export function Controls(props: ControlsProps) {
    function toggleMobileControls() {
        props.setMobileControls(!props.mobileControls);
        props.closeSideBar();
    }

    function toggleKeyboard() {
        props.toggleKeyboard();
        props.closeSideBar();
    };

    function toggleFullscreen() {
        props.toggleFullscreen();
        props.closeSideBar();
    };

    function togglePause() {
        props.setPause(!props.pause);
        props.closeSideBar();
    }

    function toggleMute() {
        props.setMute(!props.mute);
        props.closeSideBar();
    }

    return html`
    <div class="flex ${props.column ? " flex-col" : "flex-row"} justify-evenly ${props.class}">
        <div class="h-6 w-6 ${props.mobileControls ? " text-green-400" : ""} cursor-pointer"
            onClick=${toggleMobileControls}>
            <${Icons.Mobile} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.pause ? " text-green-400" : "font-bold"} cursor-pointer" onClick=${togglePause}>
            <${props.pause ? Icons.Play : Icons.Pause} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.mute ? " text-green-400" : ""} cursor-pointer" onClick=${toggleMute}>
            <${props.mute ? Icons.VolumeOff : Icons.VolumeUp} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.keyboard ? " text-green-400" : ""} cursor-pointer" onClick=${toggleKeyboard}>
            <${Icons.PencilAlt} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.fullscreen ? " text-green-400" : "" } cursor-pointer" onClick=${toggleFullscreen}>
            <${props.fullscreen ? Icons.Minimize : Icons.Fullscreen} class="h-6 w-6" />
        </div>
    </div>
    `;
}
