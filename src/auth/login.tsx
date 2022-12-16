import { Widget } from "@xsolla/login-sdk";
import { useEffect, useRef, useState } from "preact/hooks";
import { nanoid } from "nanoid";
import { auth } from "../conf";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { appSlice } from "../app";
import { CloseButton } from "../components/close-button";

type LoginWidget = { elId: string, mounted: boolean } & Widget;

export function Login() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [widget, setWidget] = useState<LoginWidget | null>(null);

    const visible = useSelector((state: State) => state.app.modal) === "login";
    const dispatch = useDispatch();

    useEffect(() => {
        const el = rootRef.current;
        if (el === null) {
            return;
        }
        const widget = new Widget({
            ...auth,
            responseType: "code",
            state: nanoid(),
            redirectUri: auth.callbackUrl,
            scope: "offline",
            showPopupBackground: false,
            showCloseButton: false,
        }) as LoginWidget;

        widget.elId = el.id;
        widget.mounted = false;
        setWidget(widget);
    }, [rootRef]);

    useEffect(() => {
        if (widget === null) {
            return;
        }

        if (visible && !widget.mounted) {
            widget.mount(widget.elId);
            widget.mounted = true;
        }
    }, [widget, visible]);

    return <div
        id={"login"}
        class={
            "login-widget " + (visible ? "block" : "hidden")
        }
        ref={rootRef}>
        <CloseButton
            class="absolute z-40 right-24 top-10"
            onClose={() => dispatch(appSlice.actions.modalNone()) }
        />
    </div>;
}
