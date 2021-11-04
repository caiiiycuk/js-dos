
import { useState } from "preact/hooks";
import { html } from "../dom";
import { Icons } from "../icons";
import { Props } from "../player-app";

interface ControlsProps extends Props {
    class?: string,
    column?: boolean,
    portal: boolean,
};

const maxScale = 1.5;
const scaleStep = (maxScale - 1.0) / 5;

export function Controls(props: ControlsProps) {
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
        <${VirtualControls} ...${props} />
        <div class="h-6 w-6 ${props.pause ? " text-red-400 animate-pulse" : "font-bold"} cursor-pointer"
            onClick=${togglePause}>
            <${props.pause ? Icons.Play : Icons.Pause} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.mute ? " text-green-400" : ""} cursor-pointer" onClick=${toggleMute}>
            <${props.mute ? Icons.VolumeOff : Icons.VolumeUp} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.keyboard ? " text-green-400" : ""} cursor-pointer" onClick=${toggleKeyboard}>
            <${Icons.PencilAlt} class="h-6 w-6" />
        </div>
        <div class="h-6 w-6 ${props.fullscreen ? " text-green-400" : "" } 
        ${props.options().noFullscreen===true ? "hidden": "" } cursor-pointer" onClick=${toggleFullscreen}>
            <${Icons.ArrowsExpand} class="h-6 w-6" />
        </div>
    </div>
    `;
}

function VirtualControls(props: ControlsProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [scale, setScale] = useState<number>(props.player().scaleControls);

    function toggleVirtualControlsOpen() {
        if (props.portal) {
            setOpen(!open);
        } else {
            props.setMobileControls(!props.mobileControls);
        }
    }

    async function eyeOff(e: Event) {
        await props.setMirroredControls(false);
        await props.setMobileControls(false);
        setOpen(false);
        e.stopPropagation();
    }

    async function mobile(e: Event) {
        await props.setMobileControls(true);
        await props.setMirroredControls(false);
        setOpen(false);
        e.stopPropagation();
    }

    async function mirrored(e: Event) {
        await props.setMirroredControls(true);
        setOpen(false);
        e.stopPropagation();
    }

    async function enlarge(e: Event) {
        let newScale = (scale + scaleStep);
        if (scale === maxScale) {
            newScale = 1;
        } else if (newScale > maxScale) {
            newScale = maxScale;
        }

        await props.player().setScaleControls(newScale);
        setScale(newScale);
        e.stopPropagation();
    }

    let scaleText = Math.round(scale * 10) / 10 + "";
    if (scaleText.length === 1) {
        scaleText += ".0";
    }

    return html`
    <div class="h-6 w-6 text-green-400 cursor-pointer" onClick=${toggleVirtualControlsOpen}>
            <${props.mirroredControls ? Icons.SwithcHorizontal :
        (props.mobileControls ? Icons.Mobile : Icons.EyeOff)} class="h-6 w-6" />
            <div class="${open ? "" : "hidden"} absolute z-50 bg-gray-200 -mt-7 h-8 left-10 flex flex-row items-center
                             rounded-r-md cursor-pointer" onClick=${()=> {}}>
                <div class="h-6 w-6 mx-2 
                    ${!props.mobileControls && !props.mirroredControls ? "text-green-400" : "text-black"}"
                    onClick=${eyeOff}>
                    <${Icons.EyeOff} class="h-6 w-6" />
                </div>
                <div class="h-6 w-6 mx-2 
                    ${!props.mirroredControls && props.mobileControls ? "text-green-400" : "text-black"}"
                    onClick=${mobile}>
                    <${Icons.Mobile} class="h-6 w-6" />
                </div>
                <div class="h-6 w-6 mx-2  ${props.mirroredControls ? "text-green-400" : "text-black"}"
                    onClick=${mirrored}>
                    <${Icons.SwithcHorizontal} class="h-6 w-6" />
                </div>
                <div class="h-6 px-2 border-l-2 border-gray-400 
                    ${scaleText === "1.0" ? "text-black" : "text-green-400" }"
                    onClick=${enlarge}>
                    ${scaleText}
                </div>
            </div>
        </div>
    `;
}
