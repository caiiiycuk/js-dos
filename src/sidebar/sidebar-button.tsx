import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector, useStore } from "react-redux";
import { getState, State, Store } from "../store";
import { Frame, uiSlice } from "../store/ui";
import { useEffect, useRef, useState } from "preact/hooks";
import { dosSlice } from "../store/dos";

export function FatDrivesButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        frame="fat-drives"
        action={uiSlice.actions.frameFatDrives()}
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
        {cycles <= 0 && <><span>~</span><sup>KC</sup></>}
        {cycles > 0 && cycles <= 1000 && <><span>{cycles}</span><sup>KC</sup></>}
        {cycles > 0 && cycles > 1000 && <><span>{Math.round(cycles / 1000)}</span><sup><strong>K</strong>KC</sup></>}
    </SidebarButton>;
}

export function HddLed(props: {}) {
    const store: Store = useStore();
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
                    const newRecv = getState(store).dos.stats.driveRecv;
                    const write = getState(store).dos.stats.driveBufferedAmount;
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

                    if (write) {
                        if (!el.classList.contains("bg-red-300")) {
                            el.classList.add("bg-red-300");
                        }
                    } else {
                        el.classList.remove("bg-red-300");
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

export function SoftKeyboardButton(props: {
    class?: string,
}) {
    const softKeyboard = useSelector((state: State) => state.dos.softKeyboard);
    const dispatch = useDispatch();

    /* eslint-disable max-len */
    return <div class={"sidebar-button " + (softKeyboard ? "sidebar-highlight " : "") +
        props.class} onClick={() => dispatch(dosSlice.actions.softKeyboard(!softKeyboard))}>
        <svg class="w-full h-full" fill="currentColor" stroke="currentColor" version="1.1" id="Layer_1" viewBox="0 0 507.9 507.9"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M465.7,140.75H268.1v-77.3c0-7.8-6.3-14.1-14.1-14.1c-7.8,0-14.1,6.3-14.1,14.1v77.3H42.3c-23.3,0-42.3,19-42.3,42.3 v233.2c0,23.3,19,42.3,42.3,42.3h423.3c23.3,0,42.3-19,42.3-42.3v-233.2C508,159.75,489,140.75,465.7,140.75z M465.7,430.35H42.3 c-7.8,0-14.1-6.3-14.1-14.1v-233.2c0-7.8,6.3-14.1,14.1-14.1h423.3c7.8,0,14.1,6.3,14.1,14.1v233.2h0.1 C479.8,424.05,473.5,430.35,465.7,430.35z"></path> </g> </g> <g> <g> <path d="M440.6,194.05h-85.4c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1h85.4c7.8,0,14.1-6.3,14.1-14.1 C454.7,200.35,448.4,194.05,440.6,194.05z"></path> </g> </g> <g> <g> <path d="M80.9,377.05H67.4c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C95,383.35,88.7,377.05,80.9,377.05z"></path> </g> </g> <g> <g> <path d="M303.3,377.05H141.6c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h161.8c7.8,0,14.1-6.3,14.1-14.1 C317.5,383.35,311.1,377.05,303.3,377.05z"></path> </g> </g> <g> <g> <path d="M80.9,255.05H67.4c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C95.1,261.35,88.7,255.05,80.9,255.05z"></path> </g> </g> <g> <g> <path d="M152.8,255.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.4,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C166.9,261.35,160.6,255.05,152.8,255.05z"></path> </g> </g> <g> <g> <path d="M224.8,255.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C238.9,261.35,232.6,255.05,224.8,255.05z"></path> </g> </g> <g> <g> <path d="M296.7,255.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C310.8,261.35,304.5,255.05,296.7,255.05z"></path> </g> </g> <g> <g> <path d="M80.9,194.05H67.4c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C95.1,200.35,88.7,194.05,80.9,194.05z"></path> </g> </g> <g> <g> <path d="M152.8,194.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.4,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C166.9,200.35,160.6,194.05,152.8,194.05z"></path> </g> </g> <g> <g> <path d="M224.8,194.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C238.9,200.35,232.6,194.05,224.8,194.05z"></path> </g> </g> <g> <g> <path d="M296.7,194.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C310.8,200.35,304.5,194.05,296.7,194.05z"></path> </g> </g> <g> <g> <path d="M368.7,255.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C382.8,261.35,376.4,255.05,368.7,255.05z"></path> </g> </g> <g> <g> <path d="M440.6,255.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C454.7,261.35,448.4,255.05,440.6,255.05z"></path> </g> </g> <g> <g> <path d="M368.7,316.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C382.8,322.35,376.4,316.05,368.7,316.05z"></path> </g> </g> <g> <g> <path d="M440.6,316.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C454.7,322.35,448.4,316.05,440.6,316.05z"></path> </g> </g> <g> <g> <path d="M368.7,377.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C382.8,383.35,376.4,377.05,368.7,377.05z"></path> </g> </g> <g> <g> <path d="M440.6,377.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C454.7,383.35,448.4,377.05,440.6,377.05z"></path> </g> </g> <g> <g> <path d="M80.9,316.05H67.4c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C95.1,322.35,88.7,316.05,80.9,316.05z"></path> </g> </g> <g> <g> <path d="M152.8,316.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.4,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C166.9,322.35,160.6,316.05,152.8,316.05z"></path> </g> </g> <g> <g> <path d="M224.8,316.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C238.9,322.35,232.6,316.05,224.8,316.05z"></path> </g> </g> <g> <g> <path d="M296.7,316.05h-13.5c-7.8,0-14.1,6.3-14.1,14.1c0,7.8,6.3,14.1,14.1,14.1h13.5c7.8,0,14.1-6.3,14.1-14.1 C310.8,322.35,304.5,316.05,296.7,316.05z"></path> </g> </g> </g></svg>
    </div>;
    /* eslint-enable max-len */
}

export function PreRunButton(props: { class?: string }) {
    return <SidebarButton
        class={props.class}
        frame="prerun"
        action={uiSlice.actions.framePreRun()}
    >
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
    </SidebarButton>;
}
