import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { LockBadge } from "../components/lock";
import { State, store } from "../store";
import { Frame, uiSlice } from "../store/ui";
import { DisketteIcon } from "./diskette-icon";
import { useEffect, useRef, useState } from "preact/hooks";

export function ImageRenderingButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        frame="image-rendering"
        action={uiSlice.actions.frameImageRendering()}
    >
        <svg xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
            class="w-full h-full">
            <path stroke-linecap="round"
                stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0
                    013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0
                    013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5
                    1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5
                    1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75
                    0 .375.375 0 01.75 0z" />
        </svg>
    </SidebarButton>;
}

export function QuickSaveButton(props: {
    class?: string,
}) {
    const disabled = useSelector((state: State) => state.auth.account) === null;
    const action = disabled ?
        uiSlice.actions.modalLogin() :
        uiSlice.actions.frameQuickSave();
    return <SidebarButton
        class={props.class + (disabled ? " opacity-50" : "")}
        frame="quick-save"
        action={action}
    >
        <DisketteIcon />
        {disabled && <LockBadge />}
    </SidebarButton>;
}

export function HostCacheButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        frame="host-cache"
        action={uiSlice.actions.frameHostCache()}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5
                0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3
                0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062
                 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0
                 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3
                 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
    </SidebarButton>;
}

export function DosboxConfButton(props: { class?: string }) {
    return <SidebarButton
        class={props.class}
        frame="editor-conf"
        action={uiSlice.actions.frameConf()}
    >
        <svg xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-full h-full">
            <path stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125
                0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5
                3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504
                 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    </SidebarButton>;
}

export function FsButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        frame="editor-fs"
        action={uiSlice.actions.frameFs()}
    >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 17.25v-.228a4.5 4.5
                0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375
                3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3
                0 01-3 3H5.25a3 3 0 01-3-3m19.5 0a3 3 0 00-3-3H5.25a3 3 0 00-3 3m16.5
                0h.008v.008h-.008v-.008zm-3 0h.008v.008h-.008v-.008z" />
        </svg>
    </SidebarButton>;
}

export function CyclesButton() {
    const cycles = Math.round(useSelector((state: State) => state.dos.stats.cyclesPerMs) / 1000);
    return <SidebarButton
        class="cycles"
        frame="stats"
        action={uiSlice.actions.frameStats()}>
        { cycles <= 0 && <><span>~</span><sup>KC</sup></> }
        { cycles > 0 && cycles <= 1000 && <><span>{cycles}</span><sup>KC</sup></> }
        { cycles > 0 && cycles > 1000 && <><span>{Math.round(cycles / 1000)}</span><sup><strong>K</strong>KC</sup></> }
    </SidebarButton>;
}

export function HddLed(props: {}) {
    const ref = useRef<HTMLDivElement>(null);
    const [state] = useState<{
        recv: number, enabled: boolean, delayLedTo: number,
    }>({ recv: 0, enabled: false, delayLedTo: 0 });

    useEffect(() => {
        if (ref.current) {
            const el = ref.current;
            el.classList.add("bg-base-300");

            const id = setInterval(() => {
                if (state.delayLedTo <= Date.now()) {
                    const newRecv = store.getState().dos.stats.driveRecv;
                    const newEnabled = state.recv !== newRecv;
                    if (newEnabled !== state.enabled) {
                        el.classList.remove("bg-base-300", "bg-green-300", "animate-led");
                        if (newEnabled) {
                            el.classList.add("bg-green-300", "animate-led");
                        } else {
                            el.classList.add("bg-base-300");
                        }
                        state.enabled = newEnabled;
                    }

                    if (newEnabled) {
                        state.delayLedTo = Date.now() + 300 + Math.random() * 1500;
                    } else {
                        state.delayLedTo = 0;
                    }

                    state.recv = newRecv;
                }
            }, 150);

            return () => {
                el.classList.remove("bg-base-300", "bg-green-300", "animate-led");
                clearInterval(id);
            };
        }
    }, [ref, state]);
    const [on, setOn] = useState<boolean>(false);
    const [off, setOff] = useState<{ recv: number, timeoutId: number | null }>({
        recv: 0,
        timeoutId: null,
    });
    const statsRecv = useSelector((state: State) => state.dos.stats.driveRecv);
    if (off.recv !== statsRecv) {
        if (!on) {
            setOn(true);
        }

        if (off.timeoutId) {
            clearTimeout(off.timeoutId);
        }

        const id = setTimeout(() => {
            setOn(false);
            setOff({
                recv: statsRecv,
                timeoutId: null,
            });
        }, 1000);

        setOff({
            recv: statsRecv,
            timeoutId: id,
        });
    }
    return <div ref={ref} class="self-end mr-2 -mt-3 w-2 h-1"></div>;
}

export function SettingsButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        action={uiSlice.actions.frameSettings()}
        frame="settings">

        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-full h-full">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55
                0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257
                1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26
                1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010
                .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298
                2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0
                01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55
                0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0
                01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0
                01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932
                6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0
                01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072
                1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>

    </SidebarButton >;
}

export function SidebarButton(props: {
    class?: string,
    frame: Frame,
    action: AnyAction,
    children: any
}) {
    const hightlight = useSelector((state: State) => state.ui.frame) === props.frame;
    const dispatch = useDispatch();

    function onClick() {
        if (hightlight) {
            dispatch(uiSlice.actions.frameNone());
        } else {
            dispatch(props.action);
        }
    }

    return <div class={"sidebar-button " + (hightlight ? "sidebar-highlight " : "") +
        props.class} onClick={onClick}>
        {props.children}
    </div>;
}
