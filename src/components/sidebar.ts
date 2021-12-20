import { html } from "../dom";

import { Props } from "../player-app";
import { Client } from "./client";
import { Controls } from "./controls";
import { Region } from "./region";
import { LatencyInfo } from "./latency-info";

import { Icons } from "../icons";

export function SideBar(props: Props) {
    if (!props.sideBar) {
        return null;
    }

    function onClose() {
        props.closeSideBar();
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
            <${Icons.XCircle} class="h-6 w-6" />
        </div>
        <div class="transform absolute text-gray-400 hover:text-gray-800
                     top-2 right-2 cursor-pointer hover:scale-125" onClick=${onHelp}>
            <${Icons.QuestionMarkCircle} class="h-6 w-6" />
        </div>

        <${Client} class="mt-2 mb-2 pb-2 border-b-2 border-green-200" ...${props} />
        <${Controls} class="mt-2" portal=${false} ...${props} />
        <div class="mt-8 mb-2 pb-2 border-b-2 border-green-200 text-gray-600 uppercase text-center">Networking</div>
        <${Region} class="mt-2" ...${props}/>
        <${LatencyInfo} ...${props}/>

        <div class="flex-grow"></div>

        <div class="${props.options().donate ? "" : "hidden"} 
            self-center uppercase mt-4
            cursor-pointer underline text-blue-400 font-mono" onClick=${openDonatePage} >Donate</div>
    </div>
    `;
}
