import { useEffect, useState } from "preact/hooks";
import { html } from "../dom";
import { Icons } from "../icons";

import { Props } from "../player-app";

export function ActionSaveOrExit(props: Props & { class: string }) {
    const onExit = props.options().onExit;
    const [pulse, setPulse] = useState<boolean>(false);
    const [busy, setBusy] = useState<boolean>(false);
    const onExitDefined = typeof onExit === "function";

    useEffect(() => {
        const preventUnload = props.options().preventUnload;

        if (busy || !onExitDefined || preventUnload === false) {
            return;
        }

        function onBeforeUnload(event: BeforeUnloadEvent) {
            if (props.player().ciPromise === undefined) {
                return;
            }

            const message = onExitDefined ?
                "Please use close button to save progress before closing!" :
                "Please use save button to save progress before closing!";

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
    }, [setPulse, props.player, busy, onExit, onExitDefined]);

    async function doSaveOrClose() {
        try {
            setPulse(false);
            setBusy(true);

            const dos = props.player();
            dos.layers.notyf.success("Saving, please wait...");

            try {
                await dos.layers.save();
            } catch (e: any) {
                console.error(e);
                dos.layers.notyf.error(e.message);
            }

            if (onExitDefined) {
                try {
                    await props.options().onBeforeExit?.();
                    await dos.stop();
                } catch (e: any) {
                    console.error(e);
                    dos.layers.notyf.error(e.message);
                }
                onExit();
            }
        } finally {
            setBusy(false);
        }
    }

    if (busy) {
        return null;
    }

    return html`
    <div class="${props.class ? props.class : ""} flex items-center justify-center 
        filter transition-opacity duration-1000
        bg-gray-200 ${pulse ? " text-red-500 animate-pulse" : "" }
        cursor-pointer" onClick=${doSaveOrClose}>
        <div class="h-6 w-6">
            <${onExitDefined ? Icons.XCircle : Icons.FloppyDisk} class="h-6 w-6" />
        </div>
    </div>
    `;
}
