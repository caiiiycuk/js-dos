import { Widget } from "@xsolla/login-sdk";
import { useEffect, useRef, useState } from "preact/hooks";
import { nanoid } from "nanoid";
import { auth } from "../conf";

export function Login() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [state] = useState<string>(nanoid());

    useEffect(() => {
        const el = rootRef.current;
        if (el === null) {
            return;
        }
        const widget = new Widget({
            ...auth,
            responseType: "code",
            state,
            redirectUri: auth.callbackUrl,
            scope: "offline",
        });

        widget.mount(el.id);
    }, [rootRef, state]);

    return <div id={"login"} class="h-full w-full" ref={rootRef}>
    </div>;
}
