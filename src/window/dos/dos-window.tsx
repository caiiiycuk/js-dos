import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { nonSerializedDosState } from "../../dos";
import { webGl } from "./render/webgl";

declare const emulators: Emulators;
declare let bundle: Uint8Array;

export function DosWindow(props: {
}) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);

    useEffect(() => {
        const ci = emulators.dosboxDirect(nonSerializedDosState.bundle!);
        ci.then(setCi);

        return () => {
            ci.then((ci) => ci.exit());
        };
    }, []);

    useEffect(() => {
        if (ci === null) {
            return;
        }
        const unmount = webGl(rootRef.current?.childNodes[0] as HTMLCanvasElement, ci);
        return unmount;
    }, [ci !== null]);

    return <div ref={rootRef} class="h-full flex-grow overflow-hidden relative">
        <canvas/>
    </div>;
}
