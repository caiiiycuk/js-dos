
import { html } from "../dom";

import { Icons } from "../icons";
import { Props } from "../player-app";
import { Controls } from "./controls";

export function ActionBar(props: Props) {
    if (!props.actionBar) {
        return null;
    }

    const addBorder = props.options().noSideBar === true && props.options().noSocialLinks === true;
    return html`
    <div class="bg-gray-200 shadow w-10 h-full overflow-hidden flex flex-col items-center">
        <${SideBarControl} ...${props} />
        <${More} ...${props} />
        <${Controls} column="true" class="flex-grow 
            ${addBorder ? "" : " border-t-2 border-gray-400"}" 
            portal=${true} ...${props} />
    </div>
    `;
}

function More(props: Props) {
    if (props.options().noSocialLinks === true || props.options().noSideBar !== true) {
        return null;
    }

    function openMore() {
        window.open("https://dos.zone/", "_blank");
    }

    return html`
        <div class="h-5 w-5 my-4 text-pink-400 cursor-pointer" onClick=${openMore}>
            <${Icons.Plus} class="h-5 w-5" />
        </div>
    `;
}

function SideBarControl(props: Props) {
    if (props.options().noSideBar === true) {
        return null;
    }

    function toggleSideBar() {
        if (props.sideBar) {
            props.closeSideBar();
        } else {
            props.openSideBar();
        }
    }

    let colorClass = "text-gray-600";
    if (props.requestClientId !== undefined && props.clientId === null) {
        colorClass = "text-red-800 animate-pulse";
    } else if (props.sideBar) {
        colorClass = "text-green-400";
    }

    return html`
    <div class="h-6 w-6 my-4 ${colorClass} cursor-pointer" onClick=${toggleSideBar}>
        <${Icons.DotsHorizontal} class="h-6 w-6" />
    </div>
    `;
}
