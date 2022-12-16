import { useDispatch, useSelector } from "react-redux";
import { appSlice } from "../app";
import { authSlice } from "../auth/auth";
import { State } from "../store";

export function AccountFrame(props: {}) {
    const account = useSelector((state: State) => state.auth.account);
    const dispatch = useDispatch();

    if (account === null) {
        return null;
    }

    function logout() {
        dispatch(authSlice.actions.logout());
        dispatch(appSlice.actions.frameNone());
    }

    return <div class="frame-root items-center">
        { account.picture !== null &&
            <img class="account-img" src={account.picture} /> }
        <div>{account.name ?? account.email}</div>
        { account.name !== null && <div class="account-email">{account.email}</div> }
        <button class="mt-8" onClick={logout}>Logout</button>
    </div>;
}
