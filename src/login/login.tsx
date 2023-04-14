import { useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";
import { CloseButton } from "../components/close-button";
import { authentificator } from "../v8/config";
import { Account, authSlice, postAuthMessage } from "../store/auth";
import { havePremium } from "../v8/subscriptions";

export function Login() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const visible = useSelector((state: State) => state.ui.modal) === "login";
    const dispatch = useDispatch();

    useEffect(() => {
        async function onAuthMessage(e: any) {
            if (e.data.action === "auth/ready") {
                postAuthMessage("auth/authenicate");
            } else if (e.data.action === "auth/authenicate") {
                const account = e.data.account as Account | null;
                if (account !== null) {
                    try {
                        account.premium = await havePremium(account.token.access_token);
                    } catch (e: any) {
                        console.error(e);
                        account.premium = false;
                    }
                    dispatch(authSlice.actions.login(e.data.account));
                } else {
                    dispatch(authSlice.actions.logout());
                    dispatch(authSlice.actions.ready());
                }
            }
        }

        window.addEventListener("message", onAuthMessage);
        return () => {
            window.removeEventListener("message", onAuthMessage);
        };
    }, []);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (iframe === null) {
            return;
        }

        postAuthMessage("auth/login");
    }, [visible]);

    return <div
        id={"login"}
        class={
            "login-widget " + (visible ? "block" : "hidden")
        }>
        <iframe id="authentificator" src={authentificator} ref={iframeRef} />
        <CloseButton
            class="absolute z-40 right-24 top-10"
            onClose={() => dispatch(uiSlice.actions.modalNone()) }
        />
    </div>;
}
