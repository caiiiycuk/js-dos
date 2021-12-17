import { useState } from "preact/hooks";
import { html } from "../dom";

import { Icons } from "../icons";
import { Props } from "../player-app";

const pages: { [key: string]: { title: string, tip: any /* VNode */ } } = {
    common: {
        title: "Tips",
        tip: html`
        <div>
            On the left side of the screen you can see a sidebar, it has a set of useful controls.
            You can hide it at any time by pressing on the arrow in the middle.
        </div>
`,
    },
    mouse: {
        title: "Mouse",
        tip: html`
        <div>
            <p class="mb-2">
                By clicking on pointer icon you can switch between <b>regular mouse emulation</b> and <b>lock mode</b>.
            </p>
            <div class="float-left">
                <${Icons.Cursor} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    - In regular mouse emulation mode game will receive
                    borwser pointer coordinates. If the browser pointer and game pointer is out of sync then use
                </p>
                <${Icons.Refresh} class="h-4 w-4 text-green-400 mx-2 inline-block" />
                <p class="inline">
                    refresh control to synchronize dos and browser pointer poistion.
                </p>
            </div>
        </div>
        `,
    },
    mouseLock: {
        title: "Mouse lock",
        tip: html`
        <div>
            <p class="mb-2">
                Some DOS games do not respect the mouse cursor position, they take into account only relative movement 
                of the mouse cursor.
            </p>
            <div class="float-left">
                <${Icons.CursorClick} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  When the mouse is locked DOS game receives only the relative movement of mouse and
                    the cursor can't leave the game screen. You can use sensitivity control (inside the mouse submenu)
                    to change the sensitivity of mouse movement.
                </p>
            </div>
        </div>
        `,
    },
    mobile: {
        title: "Mobile",
        tip: html`
        <div>
            <p>
                You can change visibility of mobile controls by pressing on of this buttons:
            </p>
            <div class="float-left">
                <${Icons.Mobile} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  shows the mobile controls if they are provided by the game.
                </p>
            </div>
            <div class="float-left">
                <${Icons.SwithcHorizontal} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  shows the mobile controls but mirrored.
                </p>
            </div>
            <div class="float-left">
                <${Icons.EyeOff} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  completely hide the mobile controls.
                </p>
            </div>
            <p>
                You can <b>SCALE</b> the size of mobile controls inside submenu.
            </p>
        </div>
        `,
    },
    other: {
        title: "Other",
        tip: html`
        <div>
            <p>
                Game controls:
            </p>
            <div class="float-left">
                <${Icons.Pause} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  pause/resume game,
                </p>
            </div>
            <div class="float-left">
                <${Icons.VolumeUp} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  mute/unmute sound,
                </p>
            </div>
            <div class="float-left">
                <${Icons.PencilAlt} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  toggle soft keyboard,
                </p>
            </div>
            <div class="float-left">
                <${Icons.ArrowsExpand} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  toggle fullscreen,
                </p>
            </div>
            <div class="float-left">
                <${Icons.DotsHorizontal} class="h-4 w-4 text-green-400 mr-2 inline-block" />
                <p class="inline">
                    -  will open the settings sidebar, where you can change additional
                    settings of js-dos like networking.
                </p>
            </div>
        </div>
        `,
    },
};

const mobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    .test(navigator.userAgent.toLowerCase()));

const pageSeq = mobile ?
    ["common", "mobile", "mouse", "mouseLock", "other"] :
    ["common", "mouse", "mouseLock", "mobile", "other"];


export function Tips(props: Props) {
    const [pageIndex, setPageIndex] = useState<number>(0);

    if (!props.showTips) {
        return null;
    }

    const page = pages[pageSeq[pageIndex]];

    function nextPage() {
        setPageIndex((pageIndex + 1) % pageSeq.length);
    }

    return html`
    <div class="absolute z-50 rounded bg-gray-200 shadow-lg top-5 right-5 w-64 p-2 border-b border-gray-800">
        <div class="flex row justify-between mb-2">
            <div class="h-6 w-6 cursor-pointer" onClick=${() => props.setShowTips(false)}>
                <${Icons.XCircle} class="h-6 w-6" />
            </div>
            <div class="text-lg font-bold">${page.title}</div>
            <div class="h-6 w-6 cursor-pointer text-blue-600 animate-pulse" onClick=${nextPage}>
                <${Icons.ArrowsCircleRight} class="h-6 w-6" />
            </div>
        </div>
        <div class="text-sm px-2 overflow-auto max-h-72">
            ${page.tip}
        </div>
    </div>
    `;
}
