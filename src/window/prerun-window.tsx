import { useDispatch, useSelector } from "react-redux";
import { BackendSelect, RenderAspectSelect, RenderSelect } from "../components/dos-option-select";
import { dosSlice } from "../store/dos";
import { State } from "../store";

export function PreRunWindow() {
    const emuVersion = useSelector((state: State) => state.dos.emuVersion);

    return <div class="overflow-hidden flex-grow flex flex-col items-center justify-center frame-color px-8">
        <Play />

        <div class="text-center">emu-version: <span class="text-ellipsis overflow-hidden">{emuVersion}</span></div>

        <div class="flex flex-row flex-wrap justify-end">
            <div class="flex flex-col items-end">
                <BackendSelect />
            </div>
            <div class="ml-10 flex flex-col items-end">
                <RenderSelect />
                <RenderAspectSelect />
            </div>
        </div>
    </div>;
}

function Play() {
    const dispatch = useDispatch();
    function onPlay() {
        dispatch(dosSlice.actions.bndPlay());
    }

    return <div class="cursor-pointer" onClick={onPlay}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="w-48 h-48 play-button">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 010
                .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
    </div>;
}
