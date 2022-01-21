import { html } from "../dom";

import { Props } from "../player-app";
import { Icons } from "../icons";

import { Main } from "./sidebar/main";
import { LatencyInfo } from "./sidebar/latency-info";
import { Networking } from "./sidebar/networking";

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
        <${Networking} ...${props} />

        <div class="flex-grow"></div>
    
        <${SocialIcons} ...${props} />
    </div>
    `;
}

function SocialIcons(props: Props) {
    if (props.options().noSocialLinks === true) {
        return null;
    }

    function openDiscrodPage() {
        window.open("https://discord.com/invite/hMVYEbG", "_blank");
    }

    function openTelegramPage() {
        window.open("https://t.me/doszone", "_blank");
    }

    function openTwitterPage() {
        window.open("https://twitter.com/intent/user?screen_name=doszone_db", "_blank");
    }

    function openDonatePage() {
        window.open("https://dos.zone/donate/", "_blank");
    }

    return html`
        <div class="flex flex-row justify-around">
            <div class="h-6 w-6 -mt-1 text-gray-600 cursor-pointer" onClick=${openDiscrodPage}>
                <${Icons.Discord} class="h-6 w-6" />
            </div>
            <div class="h-4 w-4 text-gray-600 cursor-pointer" onClick=${openTelegramPage}>
                <${Icons.Telegram} class="h-4 w-4" />
            </div>
            <div class="h-4 w-4 text-gray-600 cursor-pointer" onClick=${openTwitterPage}>
                <${Icons.Twitter} class="h-4 w-4" />
            </div>
            <div class="h-6 w-6 -mt-1 text-gray-600 cursor-pointer" onClick=${openDonatePage}>
                <${Icons.CurrencyDollar} class="h-6 w-6" />
            </div>
        </div>
    `;
}
