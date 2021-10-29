import { Emulators } from "emulators";
import { useEffect, useState } from "preact/hooks";
import { html } from "../dom";

import { Props } from "../player-app";

declare const emulators: Emulators;

export function ActionButton(props: Props) {
    const [active, setActive] = useState<boolean>(true);

    useEffect(() => {
        setActive(true);

        const id = setTimeout(() => {
            setActive(false);
        }, 2000);

        return () => {
            clearTimeout(id);
        };
    }, [props.sideBar, props.portrait, props.actionBar]);

    if (props.sideBar) {
        return null;
    }

    if (!props.portrait && props.actionBar) {
        return null;
    }

    return html`
    <div class="filter transition-opacity duration-1000 absolute z-50 
                    ${ active ? "opacity-80" : "opacity-20" } hover:opacity-100
                    bg-no-repeat bg-cover 
                    w-12 h-12 top-4 right-4 
                     hover:bg-blue-400 bg-blend-luminosity
                    rounded-full ring-2 ring-gray-200
                    drop-shadow cursor-pointer" 
                    style=${ "background-image: url(" + emulators.pathPrefix + "logo.png)" }
                    onClick=${props.openSideBar}>
    </div>
    `;
}
