import { Emulators, CommandInterface } from "emulators";
import { useEffect, useRef, useState } from "preact/hooks";
import { webGl } from "../render/webgl";

export function DosPlayer(props: {
    emulators: Emulators
}) {
    const emulators = props.emulators;
    const rootRef = useRef<HTMLDivElement>(null);
    const [bundle, setBundle] = useState<Uint8Array | null>(null);
    const [ci, setCi] = useState<CommandInterface | null>(null);

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current as HTMLDivElement;
        fetch("http://localhost:8080/test/digger.jsdos").then(async (response) => {
            setBundle(new Uint8Array(await response.arrayBuffer()));
        }).catch(console.error);
    }, [rootRef]);

    useEffect(() => {
        if (bundle === null) {
            return;
        }

        const ci = emulators.dosboxDirect(bundle);
        ci.then(setCi);

        return () => {
            ci.then((ci) => ci.exit());
        };
    }, [bundle !== null]);

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
