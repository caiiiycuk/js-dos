import { useT } from "../i18n";
import { SockdriveBackend } from "../components/dos-option-select";
import { useDispatch, useSelector } from "react-redux";
import { sockdriveBackend } from "../store/init";
import { State } from "../store";
import { useEffect, useState } from "preact/hooks";
import { dispatchLoginAction, uiSlice } from "../store/ui";
import { LockBadge } from "../components/lock";

interface Drive {
    name: string,
    owner: string
    fork_of: string[],
    template: string,
}

export function FatDrivesFrame() {
    const t = useT();
    const account = useSelector((state: State) => state.auth.account);
    const { sockdriveEndpoint } = useSelector((state: State) =>
        sockdriveBackend[state.init.sockdriveBackendName] ??
        sockdriveBackend["js-dos"]);
    const [myDrives, setMyDrives] = useState<Drive[]>([]);
    const dispatch = useDispatch();
    const preimium = account?.premium ?? false;
    const me = account?.email ?? "";
    const [filter, setFilter] = useState<string>("");

    function reloadDrives() {
        if (!account || !account.token) {
            setMyDrives([]);
        } else {
            fetch(sockdriveEndpoint + "/list/drives/" + account.token.access_token)
                .then((r) => r.json())
                .then((drives: Drive[]) => {
                    setMyDrives(drives.sort((a, b) => a.name.localeCompare(b.name)));
                })
                .catch(console.error);
        }
    }

    useEffect(() => {
        reloadDrives();
    }, [account?.token, sockdriveEndpoint]);

    return <div class="frame-root items-start gap-3 px-4">
        <SockdriveBackend multiline={true} class="w-full " />
        <input class="input input-bordered input-sm w-full" placeholder={t("filter")}
            value={filter} onChange={(e) => setFilter(e.currentTarget.value ?? "")}></input>
        <div class="w-full">
            <table class="table w-full">
                <thead>
                    <tr>
                        <th>{t("net_drives")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {myDrives
                        .filter(({ owner, name }) => filter.length === 0 ||
                            owner.indexOf(filter) >= 0 || name.indexOf(filter) >= 0)
                        // eslint-disable-next-line camelcase
                        .map(({ name, owner, fork_of }, index) => {
                            return <>
                                <tr>
                                    <td onClick={() => { }}>
                                        <p class="font-bold">{name}</p>
                                        {
                                            // eslint-disable-next-line camelcase
                                            fork_of.map((path) => {
                                                return <p class="text-xs">&nbsp;&nbsp;&nbsp;&nbsp;{path}</p>;
                                            })}
                                        {owner !== account?.email &&
                                            <p class="text-xs">{owner}</p>}
                                    </td>
                                    {preimium && <td>
                                        {account?.token && <div class="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                const newName = prompt("Enter drive name");
                                                if (newName && newName.length > 0) {
                                                    // eslint-disable-next-line max-len
                                                    fetch(`${sockdriveEndpoint}/fork/drive/${owner}/${name}/${newName}/${account.token.access_token}`, {
                                                        method: "POST",
                                                    })
                                                        .then((r) => r.json())
                                                        .then((response) => {
                                                            if (response.error) {
                                                                throw new Error(response.error);
                                                            } else {
                                                                setMyDrives([]);
                                                                reloadDrives();
                                                            }
                                                        })
                                                        .catch((e) => {
                                                            console.error(e.message);
                                                            dispatch(uiSlice.actions
                                                                .showToast({ message: e.message, intent: "error" }));
                                                        });
                                                }
                                            }}>Fork</div>}
                                        {account?.token && owner === me && <div class="btn btn-xs btn-ghost"
                                            onClick={() => {
                                                // eslint-disable-next-line max-len
                                                fetch(`${sockdriveEndpoint}/fork/delete/${owner}/${name}/${account.token.access_token}`, { method: "POST" })
                                                    .then((r) => r.json())
                                                    .then((response) => {
                                                        if (response.error) {
                                                            throw new Error(response.error);
                                                        } else {
                                                            const newDrives = [...myDrives];
                                                            newDrives.splice(index, 1);
                                                            setMyDrives(newDrives);
                                                        }
                                                    })
                                                    .catch((e) => {
                                                        console.error(e.message);
                                                        dispatch(uiSlice.actions
                                                            .showToast({ message: e.message, intent: "error" }));
                                                    });
                                            }}>{t("delete")}</div>}
                                    </td>}
                                    {!preimium && <td>
                                        <div class="cursor-pointer"
                                            onClick={() => dispatchLoginAction(account, dispatch)}>
                                            <LockBadge class="text-error" />
                                        </div>
                                    </td>}
                                </tr>
                            </>;
                        })}
                </tbody>
            </table>
        </div>
    </div>;
}
