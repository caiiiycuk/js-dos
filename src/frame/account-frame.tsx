import { useDispatch, useSelector } from "react-redux";
import { useState } from "preact/hooks";
import { uiSlice } from "../store/ui";
import { authSlice } from "../store/auth";
import { useT } from "../i18n";
import { State } from "../store";
import { linkToBuy } from "../v8/subscriptions";

export function AccountFrame(props: {}) {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const dispatch = useDispatch();

    if (account === null) {
        return null;
    }

    function logout() {
        dispatch(authSlice.actions.logout());
        dispatch(uiSlice.actions.frameNone());
    }

    return <div class="account-frame frame-root items-center">
        {account.picture !== null &&
            <img class="account-img" src={account.picture} />}
        <div>{account.name ?? account.email}</div>
        {account.name !== null && <div class="account-email">{account.email}</div>}
        <button class="button mt-8" onClick={logout}>{t("logout")}</button>

        <div class="mt-8 mb-4 text-2xl">{t("features")}</div>
        <PremiumPlan />
    </div>;
}

function PremiumPlan(props: {}) {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const [locked, setLocked] = useState<boolean>(false);

    if (account === null) {
        return null;
    }

    const token = account.token.access_token;
    function onBuy() {
        if (locked) {
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

    return <div class={ "premium-plan-root " + (account.premium ? "have-premium" : "") }>
        <div class="premium-plan-head">{t("premium")}</div>
        { !account.premium &&
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
                <button class={ "button w-full " + (locked ? "hidden" : "") } onClick={onBuy}>{t("buy")}</button>
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
                <div>{t("game_no_limits")}</div>
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
