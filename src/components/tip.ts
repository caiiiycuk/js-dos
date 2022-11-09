import { useEffect, useState } from "preact/hooks";
import { html } from "../dom";

import { Icons } from "../icons";
import { Props } from "../player-app";

const pages: { [key: string]: { title: string, tip: any /* VNode */ } } = {
    mouseLockMobile: {
        title: "Mouse lock",
        tip: html`
        <div>
            <div class="flex flex-col">
                <p class=""> 
                    <strong>This game is controlled by gestures.</strong>
                </p>
                <p class="pt-2">
                    When you tap on the screen, the DOS game will receive click events without
                    mouse coordinates. <b>The click will be simulated in place where game cursor 
                    is, without moving it.</b>
                </p>
                <p class="pt-2">
                    <strong>To move the game cursor</strong>, you need to put your finger on the screen and move it in
                    the wanted direction until the game cursor reaches the desired position. After that,
                    you can release your finger.
                </p>
                <p class="pt-2">
                    You can <strong>change sensitivity</strong> of the mouse inside the
                    submenu of icon <${Icons.CursorClick} class="h-4 w-4 text-green-600 mr-2 inline-block" />.
                </p>
            </div>
        </div>
        `,
    },
    mouseLockDesktop: {
        title: "Mouse lock",
        tip: html`
        <div>
            <div class="flex flex-col">
                <p class=""> 
                    <strong>The game will lock the browser cursor.</strong>
                </p>
                <p class="pt-2">
                    When the mouse is locked, the DOS game exclusively controls the mouse and
                    the cursor can't leave the game screen. 
                </p>
                <p class="pt-2">
                    You can <strong>change sensitivity</strong> of the mouse inside the
                    submenu of icon <${Icons.CursorClick} class="h-4 w-4 text-green-600 mr-2 inline-block" />.
                </p>
                <p class="pt-2">
                    To exit from lock mode, please use the <strong>Escape</strong> key.
                </p>
            </div>
        </div>
        `,
    },
    lockSwitch: {
        title: "Mouse Locking",
        tip: html`
        <div class="flex flex-col">
            <p class="">
                By clicking on the pointer icon, you can switch between <b>regular mouse emulation</b> and 
                <b>lock mode</b>.
            </p>
            <div class="mt-2">
                <${Icons.Cursor} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    - In regular mouse emulation mode, the game will receive
                    browser pointer coordinates. If the browser pointer and game pointer are out of sync, use the
                </p>
                <${Icons.Refresh} class="h-4 w-4 text-green-600 mx-2 inline-block" />
                <p class="inline">
                    refresh control to synchronize DOS and browser pointer position.
                </p>
            </div>
            <div class="mt-2">
                <${Icons.CursorClick} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    - lock mouse emulation mode.
                </p>
            </div>
            <div class="mt-2">
                <strong>On desktop</strong>, the DOS game exclusively controls the mouse and
                the cursor can't leave the game screen.
            </div>
            <div class="mt-2">
                <strong>On mobile</strong>, the DOS game will be controlled by gestures.
            </div>
        </div>
        `,
    },
    mobile: {
        title: "Mobile Controls",
        tip: html`
        <div class="flex flex-col">
            <p>
                You can change the visibility of mobile controls by pressing one of these buttons:
            </p>
            <div class="pt-2">
                <${Icons.Mobile} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  shows the mobile controls if they are provided by the game.
                </p>
            </div>
            <div class="pt-2">
                <${Icons.SwithcHorizontal} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  shows the mobile controls but <strong>mirrored</strong>.
                </p>
            </div>
            <div class="pt-2">
                <${Icons.EyeOff} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  completely hide the mobile controls.
                </p>
            </div>
            <p class="pt-2">
                You can <b>change size</b> of mobile controls inside the submenu.
            </p>
        </div>
        `,
    },
    sidebar: {
        title: "Sidebar",
        tip: html`
        <div class="flex flex-col">
            <div>
                On the left side of the screen, you will see a sidebar; it has a set of useful controls.
                You can hide it at any time by pressing on the arrow in the middle.
            </div>
            <div class="pt-2">
                <${Icons.Pause} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  pause/resume game,
                </p>
            </div>
            <div class="pt-2">
                <${Icons.VolumeUp} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  mute/unmute sound,
                </p>
            </div>
            <div class="pt-2">
                <${Icons.PencilAlt} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  toggle soft keyboard,
                </p>
            </div>
            <div class="pt-2">
                <${Icons.ArrowsExpand} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  toggle fullscreen,
                </p>
            </div>
            <div class="pt-2">
                <${Icons.DotsHorizontal} class="h-4 w-4 text-green-600 mr-2 inline-block" />
                <p class="inline">
                    -  will open the settings sidebar, where you can change additional
                    settings of js-dos, like networking.
                </p>
            </div>
        </div>
        `,
    },
    saveLoad: {
        title: "Save/Load",
        tip: html`
        <div>
            <div class="flex flex-col">
                <p class=""> 
                    js-dos supports saving and restoring game progress. You can play a game from time to time 
                    without losing progress. This works automatically or by pressing the
                    <${Icons.FloppyDisk} class="h-4 w-4 text-green-600 mx-1 -mt-1 inline-block" />
                    icon.
                </p>
                <p class="pt-2">
                    However, it works only if the DOS game itself supports save and load commands.
                    <strong> You need to save your progress in the DOS game before stopping the emulator.</strong>
                </p>
            </div>
        </div>
        `,
    },
};

const mobile = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
    .test(navigator.userAgent.toLowerCase()));

const pageSeq = mobile ?
    ["mouseLockMobile", "mobile", "sidebar", "saveLoad", "lockSwitch"] :
    ["mouseLockDesktop", "sidebar", "saveLoad", "lockSwitch"];


export function Tips(props: Props) {
    const showTips = props.showTips;
    const [pageIndex, setPageIndex] = useState<number>(0);

    useEffect(() => {
        if (!showTips) {
            return;
        }

        setPageIndex(props.player().autolock ? 0 : 1);
    }, [showTips]);

    if (!showTips) {
        return null;
    }

    const page = pages[pageSeq[pageIndex]];
    const lastPage = (pageIndex === pageSeq.length - 1);

    function nextPage(e: Event) {
        if (lastPage) {
            props.setShowTips(false);
        } else {
            setPageIndex((pageIndex + 1) % pageSeq.length);
        }
        e.stopPropagation();
        e.preventDefault();
    }

    return html`
    <div class="absolute bg-gray-500 bg-opacity-80 left-0 top-0 right-0 bottom-0 
        flex flex-col items-center justify-center z-50">
        <div class="rounded bg-gray-200 shadow-lg w-3/4 sm:w-1/2 p-2 border-b border-gray-800 overflow-auto">
            <div class="flex row justify-between mb-2">
                <div class="h-6 w-6 text-gray-400">
                    <${Icons.InformationCircle} class="h-6 w-6" />
                </div>
                <div class="text-lg font-bold">${page.title}</div>
                <div class="h-6 w-6 cursor-pointer" onClick=${() => props.setShowTips(false)}>
                    <${Icons.XCircle} class="h-6 w-6" />
                </div>
            </div>
            <div class="text-sm px-2 overflow-hidden max-h-72">
                ${page.tip}
            </div>
            <div class="flex flex-row justify-center mt-2" onClick=${nextPage}>
                <p class="uppercase cursor-pointer text-blue-900 mr-2">${ lastPage ? "Close" : "Next"}</p>
                ${ !lastPage && html`
                    <div class="h-6 w-6 cursor-pointer text-blue-900">
                        <${Icons.ArrowsCircleRight} class="h-6 w-6" />
                    </div>` }
            </div>
        </div>
    </div>
    `;
}
