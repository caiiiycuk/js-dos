import { AnyAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { Frame, uiSlice } from "../store/ui";

export function HostCacheButton(props: {
    class?: string,
}) {
    return <SidebarButton
        class={props.class}
        frame="host-cache"
        action={uiSlice.actions.frameHostCache()}
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
        <span>{cycles === 0 ? "~" : cycles}</span><sup>KC</sup>
    </SidebarButton>;
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
