import { Dispatch, useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { State } from "../store";
import { uiSlice } from "../store/ui";
import { CloseButton } from "../components/close-button";
import { authentificator } from "../v8/config";
import { Account, authSlice, getRefreshToken } from "../store/auth";
import { havePremium } from "../v8/subscriptions";
import { AnyAction } from "@reduxjs/toolkit";

export function Login() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const activeAccount = useSelector((state: State) => state.auth.account);
    const visible = useSelector((state: State) => state.ui.modal) === "login";
    const loginUrl = useSelector((state: State) => state.auth.loginUrl);
    const dispatch = useDispatch();

    useEffect(() => {
        if (activeAccount != null) {
            return;
        }

        const iframe = iframeRef.current;
        if (iframe === null) {
            dispatch(authSlice.actions.logout({}));
            dispatch(authSlice.actions.ready());
            console.error("Unable to inialize authentificator!");
            return;
        }

        async function onAuthMessage(e: any) {
            if (e.data.action === "auth/ready") {
                postAuthMessage("auth/authenicate", iframe as HTMLIFrameElement, dispatch);
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
                    dispatch(authSlice.actions.logout({}));
                    dispatch(authSlice.actions.ready());
                }
            }
        }

        window.addEventListener("message", onAuthMessage);
        iframe.src = authentificator;

        return () => {
            window.removeEventListener("message", onAuthMessage);
        };
    }, []);

    useEffect(() => {
        if (visible) {
            const iframe = iframeRef.current;
            if (iframe === null) {
                return;
            }

            postAuthMessage("auth/login", iframe, dispatch, loginUrl);
        }
    }, [visible, loginUrl]);

    return <div
        id={"login"}
        class={
            "login-widget " + (visible ? "block" : "hidden")
        }>
        <iframe id="authentificator" ref={iframeRef} />
        <CloseButton
            class="absolute z-40 right-24 top-10"
            onClose={() => dispatch(uiSlice.actions.modalNone()) }
        />
    </div>;
}

function postAuthMessage(action: "auth/login" | "auth/authenicate",
                         iframe: HTMLIFrameElement,
                         dispatch: Dispatch<AnyAction>,
                         loginUrl?: string) {
    const message = {
        action,
        refresh_token: action === "auth/authenicate" ? getRefreshToken() : undefined,
        url: action === "auth/login" ? loginUrl : undefined,
    };
    if (!iframe || !iframe.contentWindow) {
        console.error("Can't find authentificator iframe");
        dispatch(authSlice.actions.logout({}));
        dispatch(authSlice.actions.ready());
    } else {
        iframe.contentWindow.postMessage(message, "*");
    }
}
