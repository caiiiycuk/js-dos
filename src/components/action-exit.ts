import { useEffect, useState } from "preact/hooks";
import { html } from "../dom";
import { Icons } from "../icons";

import { Props } from "../player-app";

export function ActionExit(props: Props) {
    const onExit = props.options().onExit;
    const [pulse, setPulse] = useState<boolean>(false);
    const [closing, setClosing] = useState<boolean>(false);

    useEffect(() => {
        if (closing || typeof onExit !== "function") {
            return;
        }

        function onBeforeUnload(event: BeforeUnloadEvent) {
            if (props.player().ciPromise === undefined) {
                return;
            }

            const message = "Please use close button to save progress!";

            setTimeout(() => {
                props.player().layers.notyf.error(message);
                setPulse(true);
            }, 16);

            event.preventDefault();
            event.returnValue = message;
        }

        window.addEventListener("beforeunload", onBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
        };
    }, [setPulse, props.player, closing, onExit]);

    async function doClose() {
        setPulse(false);
        setClosing(true);
        const dos = props.player();
        dos.layers.notyf.success("Saving, please wait...");
        try {
            await dos.layers.save();
        } catch (e) {
            setClosing(false);
            return;
        }

        try {
            await dos.stop();
        } catch (e) {
            console.error(e);
        }

        const onExit = props.options().onExit;
        if (onExit !== undefined) {
            onExit();
        }

        setClosing(false);
    }

    if (closing || typeof onExit !== "function" || props.sideBar) {
        return null;
    }

    return html`
    <div class="filter transition-opacity duration-1000 absolute z-50 
                                    bg-gray-200 opacity-80 ${pulse ? " text-red-500 animate-pulse" : "" } w-6 h-6 top-0
        ${props.actionBar ? "left-10" : "left-0" } rounded-br-md cursor-pointer" onClick=${doClose}>
        <div class="h-4 w-4 mt-1 ml-1">
            <${Icons.XCircle} class="h-4 w-4" />
        </div>
    </div>
    `;
}
