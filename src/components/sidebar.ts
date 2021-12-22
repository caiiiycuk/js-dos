import { html } from "../dom";

import { Props } from "../player-app";
import { Main } from "./sidebar/main";

import { Icons } from "../icons";
import { LatencyInfo } from "./sidebar/latency-info";

export function SideBar(props: Props) {
    if (!props.sideBar) {
        return null;
    }

    function onClose() {
        if (props.sideBarPage === "main") {
            props.closeSideBar();
        } else {
            props.setSideBarPage("main");
        }
    };

    function onHelp() {
        props.setShowTips(true);
        props.closeSideBar();
    };

    function openDonatePage() {
        window.open("https://dos.zone/donate/", "_blank");
    }

    return html`
    <div class="flex flex-col filter absolute z-50 top-0 bottom-0 right-0 px-8 pt-6
            w-full sm:w-80 rounded-l-lg drop-shadow-lg bg-white overflow-y-auto overflow-x-hidden pb-4">
        <div class="transform absolute text-gray-400 hover:text-gray-800
                         top-2 left-2 cursor-pointer hover:scale-125" onClick=${onClose}>
            <${props.sideBarPage === "main" ? Icons.XCircle : Icons.ArrowsCircleLeft} class="h-6 w-6" />
        </div>
        <div class="transform absolute text-gray-400 hover:text-gray-800
                         top-2 right-2 cursor-pointer hover:scale-125" onClick=${onHelp}>
            <${Icons.QuestionMarkCircle} class="h-6 w-6" />
        </div>
    
    
        <${Main} ...${props} />
        <${LatencyInfo} ...${props} />
        <div class="flex-grow"></div>
    
        <div class="${props.options().donate ? "" : " hidden"} self-center uppercase mt-4 cursor-pointer underline
            text-blue-400 font-mono" onClick=${openDonatePage}>Donate</div>
    </div>
    `;
}
