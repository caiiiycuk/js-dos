import { useEffect } from "preact/hooks";
import { html } from "../dom";

import { Props } from "../player-app";
import { Icons } from "../icons";

import { Main } from "./sidebar/main";
import { LatencyInfo } from "./sidebar/latency-info";
import { Networking } from "./sidebar/networking";

import { getAutoRegion } from "../backend/v7/latency";

export function SideBar(props: Props) {
    if (!props.sideBar) {
        return null;
    }

    useEffect(() => {
        if (!(props.options().withNetworkingApi) ||
            props.region !== null) {
            return;
        }

        getAutoRegion(props.setEstimatingRegion)
            .then((latencyInfo) => {
                props.setLatencyInfo(latencyInfo);
                props.setRegion(latencyInfo.region);
            })
            .catch(console.error);
    }, [props.region]);

    function onClose() {
        if (props.sideBarPage === "main") {
            props.closeSideBar();
        } else {
            props.setSideBarPage("main");
        }
    };

    const networking = props.sideBarPage === "networking";

    function onHelp() {
        if (networking) {
            props.options().windowOpen("https://youtu.be/XEoWLQmU168", "_blank");
            return;
        }
        props.setShowTips(true);
        props.closeSideBar();
    };

    return html`
    <div class="flex flex-col filter absolute z-50 top-0 bottom-0 right-0 px-8 pt-6
                w-full sm:w-80 rounded-l-lg drop-shadow-lg bg-white overflow-y-auto overflow-x-hidden pb-4">
        <div class="transform absolute text-gray-400 hover:text-gray-800
                            top-2 left-2 cursor-pointer hover:scale-125" onClick=${onClose}>
            <${props.sideBarPage==="main" ? Icons.XCircle : Icons.ArrowsCircleLeft} class="h-6 w-6" />
        </div>
        <div class="transform absolute text-gray-400 hover:text-gray-800
                             top-2 right-2 cursor-pointer hover:scale-125
                             ${ networking ? "text-purple-400" : ""}" onClick=${onHelp}>
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

    const matchmaking = props.sideBarPage === "networking";

    function openDiscrodPage() {
        props.options().windowOpen("https://discord.com/invite/hMVYEbG", "_blank");
    }

    function openTelegramPage() {
        props.options().windowOpen("https://t.me/doszonechat", "_blank");
    }

    function openTwitterPage() {
        props.options().windowOpen("https://twitter.com/intent/user?screen_name=doszone_db", "_blank");
    }

    function openDonatePage() {
        props.options().windowOpen("https://dos.zone/donate/", "_blank");
    }

    if (matchmaking === true) {
        return html`
        <div class="flex flex-row justify-around items-center">
            <div class="font-bold text-purple-600">Matchmaking:</div>
            <div class="h-6 w-6 text-gray-600 cursor-pointer" onClick=${openDiscrodPage}>
                <${Icons.Discord} class="h-6 w-6" />
            </div>
            <div class="h-4 w-4 mt-0.5 text-gray-600 cursor-poiner" onClick=${openTelegramPage}>
                <${Icons.Telegram} class="h-4 w-4" />
            </div>
        </div>
    `;
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
