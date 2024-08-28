import { useDispatch, useSelector } from "react-redux";
import { useState } from "preact/hooks";
import { uiSlice } from "../store/ui";
import { authSlice } from "../store/auth";
import { useT } from "../i18n";
import { State } from "../store";
import { linkToBuy, cancle as cancelSubscription } from "../v8/subscriptions";
import { cancelSubscriptionPage } from "../v8/config";

export function AccountFrame(props: {}) {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const dispatch = useDispatch();

    if (account === null) {
        return null;
    }

    function logout() {
        dispatch(authSlice.actions.logout({}));
        dispatch(uiSlice.actions.frameNone());
    }

    return <div class="account-frame frame-root items-center">
        {account.picture !== null &&
            <img class="account-img" src={account.picture} />}
        <div class="font-bold flex flex-row">
            {account.picture === null &&
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-2">
                    <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25
                        0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786
                        0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
                </svg>}
            {account.name ?? account.email}
        </div>
        <button class="btn mt-8 w-full" onClick={logout}>{t("logout")}</button>

        <div class="mt-8 mb-4 flex flex-row items-center">
            <div class="text-2xl">{t("features")}</div>
            <div class="ml-2 cursor-pointer self-end text-primary" onClick={openPremiumPage}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025
                                4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45
                                1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            </div>
        </div>
        <PremiumPlan />
    </div>;
}

function PremiumPlan(props: {}) {
    const t = useT();
    const lang = useSelector((state: State) => state.i18n.lang);
    const account = useSelector((state: State) => state.auth.account);
    const [locked, setLocked] = useState<boolean>(false);
    const dispatch = useDispatch();

    if (account === null) {
        return null;
    }

    const token = account.token.access_token;
    function onBuy() {
        if (locked) {
            return;
        }

        if (location.host !== "js-dos.com") {
            window.open("https://js-dos.com/subscription.html#subscribe", "_blank");
            return;
        }

        setLocked(true);
        linkToBuy(token)
            .then((link) => {
                if (link !== null) {
                    window.open(link, "_blank");
                }
            })
            .catch(console.error)
            .finally(() => setLocked(false));
    }

    async function cancle() {
        const openPage = () => {
            dispatch(uiSlice.actions.showToast({
                message: t("unable_to_cancle_subscription"),
                intent: "error",
            }));
            window.open(cancelSubscriptionPage[lang] ?? cancelSubscriptionPage.en, "_blank");
        };
        if (!account) {
            openPage();
        } else {
            try {
                if (await cancelSubscription(account.token.access_token)) {
                    dispatch(uiSlice.actions.showToast({
                        message: t("subscription_cancelled"),
                        intent: "success",
                    }));
                } else {
                    openPage();
                }
            } catch (e) {
                openPage();
            }
        }
    }

    return <div class={"premium-plan-root " + (account.premium ? "have-premium" : "")}>
        <div class="premium-plan-head flex">
            { account.premium && <PremiumCheck /> }
            <div class="cursor-pointer underline" onClick={openPremiumPage}>{t("premium")}</div>
            <div class="flex-grow"></div>
            {account.premium &&
                <button
                    onClick={cancle}
                    class="ml-2 btn btn-ghost btn-xs text-success-content">
                    {t("cancle")}
                </button>}
        </div>
        {!account.premium &&
            <>
                <div class="flex flex-row my-6 items-top">
                    <div class="premium-plan-cost">
                        $3
                    </div>
                    <div class="premium-plan-cost-expl">
                        <div>USD / mo</div>
                        <div><span class="text-blue-600">5</span> {t("try_free")}</div>
                    </div>
                </div>
                <button class={"btn btn-primary w-full " + (locked ? "hidden" : "")} onClick={onBuy}>
                    {t("buy")}
                </button>
            </>
        }
        <div class="flex flex-col mt-4">
            <div class="premium-plan-highlight">
                <PremiumCheck />
                <div>{t("cloud_saves")}</div>
            </div>
            <div class="premium-plan-highlight">
                <PremiumCheck />
                <div>{t("experimental_features")}</div>
            </div>
            <div class="premium-plan-highlight">
                <PremiumCheck />
                <div>{t("writeable_fat32")}</div>
                <div class="flex-grow"></div>
                <button
                    onClick={() => dispatch(uiSlice.actions.frameFatDrives())}
                    target="_blank"
                    class="ml-2 btn btn-xs text-success-content">
                    {t("manage")}
                </button>
            </div>
            <div class="premium-plan-highlight">
                <PremiumCheck />
                <div>{t("net_no_limits")}</div>
            </div>
            <div class="premium-plan-highlight" style="border-bottom: 0px">
                <PremiumCheck />
                <div>{t("unlock_options")}</div>
            </div>
        </div>
    </div>;
}

function PremiumCheck(props: {}) {
    return <svg xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
        class="mr-4 w-6 h-6 text-blue-500 flex-shrink-0">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>;
}

function openPremiumPage() {
    window.open("https://js-dos.com/cloud-overview.html", "_blank");
}
