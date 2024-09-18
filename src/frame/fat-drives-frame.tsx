import { useT } from "../i18n";
import { SockdriveBackend } from "../components/dos-option-select";
import { useDispatch, useSelector } from "react-redux";
import { sockdriveBackend } from "../store/init";
import { State } from "../store";
import { useEffect, useRef, useState } from "preact/hooks";
import { uiSlice } from "../store/ui";
import { LockBadge } from "../components/lock";
import { isSockdrivePremium } from "../player-api";

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
    const me = account?.email ?? "";
    const [filter, setFilter] = useState<string>("");
    const [busy, setBusy] = useState<boolean>(true);
    const forkDialogRef = useRef<HTMLDialogElement>(null);
    const deleteDialogRef = useRef<HTMLDialogElement>(null);
    const [forkName, setForkName] = useState<string>("");
    const [deleteConfirm, setDeleteConfirm] = useState<string>("");
    const [dialogError, setDialogError] = useState<string | null>(null);
    const [dialogIndex, setDialogIndex] = useState<number>(-1);
    const [sockdrivePremium, setSockdrivePremium] = useState<boolean>(false);
    const premium = (account?.premium ?? false) || sockdrivePremium;


    function reloadDrives() {
        if (!account || !account.token) {
            setMyDrives([
                {
                    "fork_of": [],
                    "name": "fat32-2gb",
                    "owner": "system",
                    "template": "fat32-2gb",
                },
                {
                    "fork_of": [],
                    "name": "fat16-256m",
                    "owner": "system",
                    "template": "fat16-256m",
                },
                {
                    "fork_of": [
                        "system/fat16-256m",
                    ],
                    "name": "win95-v1",
                    "owner": "system",
                    "template": "fat16-256m",
                },
                {
                    "fork_of": [
                        "system/fat16-256m",
                    ],
                    "name": "dos7.1-v1",
                    "owner": "system",
                    "template": "fat16-256m",
                },
                {
                    "fork_of": [
                        "system/fat32-2gb",
                    ],
                    "name": "win98-v1",
                    "owner": "system",
                    "template": "fat32-2gb",
                },
                {
                    "fork_of": [
                        "system/fat32-2gb",
                    ],
                    "name": "win95-v2",
                    "owner": "system",
                    "template": "fat32-2gb",
                },
            ]);
            setBusy(false);
        } else {
            setBusy(true);
            fetch(sockdriveEndpoint + "/list/drives/" + account.token)
                .then((r) => r.json())
                .then((drives: Drive[]) => {
                    setMyDrives(drives.sort((a, b) => a.name.localeCompare(b.name)));
                })
                .catch(console.error)
                .finally(() => setBusy(false));

            isSockdrivePremium(sockdriveEndpoint, account)
                .then(setSockdrivePremium)
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
            {!busy && <table class="table w-full">
                <thead>
                    <tr>
                        <th>{t("net_drives")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        // eslint-disable-next-line camelcase
                        myDrives.map(({ name, owner, fork_of }, index) => {
                            if (filter.length > 0 &&
                                owner.indexOf(filter) === -1 && name.indexOf(filter) === -1) {
                                return null;
                            }
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
                                    {premium && <td>
                                        {account?.token && <div class="btn btn-ghost btn-xs"
                                            onClick={() => {
                                                setDialogIndex(index);
                                                forkDialogRef.current?.showModal();
                                            }}>Fork</div>}
                                        {account?.token && owner === me && <div class="btn btn-xs btn-ghost"
                                            onClick={() => {
                                                setDialogIndex(index);
                                                deleteDialogRef.current?.showModal();
                                            }}>{t("delete")}</div>}
                                    </td>}
                                    {!premium && <td>
                                        <div class="cursor-pointer"
                                            onClick={() => dispatch(uiSlice.actions.warnOnPremium(true))}>
                                            <LockBadge class="text-error" />
                                        </div>
                                    </td>}
                                </tr>
                            </>;
                        })}
                </tbody>
            </table>
            }
            {busy && <span class="loading loading-spinner loading-lg"></span>}
        </div>
        <dialog ref={forkDialogRef} class="modal">
            {!busy && dialogIndex >= 0 && account !== null && <div class="modal-box">
                <h3 class="font-bold text-lg">{t("enter_name_of_drive")}:</h3>
                <p class="text-xs text-neutral-content mt-2">
                    fork of: {myDrives[dialogIndex].owner}/{myDrives[dialogIndex].name}
                </p>
                <input type="text" placeholder="name" value={forkName}
                    class="mt-6 input input-bordered input-primary w-full" onChange={(e) =>
                        setForkName(e.currentTarget.value)} />
                {dialogError !== null &&
                    <p class="mt-2 text-error">{t("error")}: {dialogError}</p>}
                <div class="modal-action">
                    {forkName.length > 0 && <button class="btn mr-2 btn-primary" onClick={() => {
                        setDialogIndex(-1);
                        setBusy(true);
                        // eslint-disable-next-line max-len
                        fetch(`${sockdriveEndpoint}/fork/drive/${myDrives[dialogIndex].owner}/${myDrives[dialogIndex].name}/${forkName}/${account.token}`, {
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
                                forkDialogRef.current?.close();
                            })
                            .catch((e) => {
                                console.error(e.message);
                                dispatch(uiSlice.actions
                                    .showToast({ message: e.message, intent: "error" }));
                            })
                            .finally(() => {
                                setBusy(false);
                            });
                    }}>{t("fork")}</button>}
                    <button class="btn" onClick={() => forkDialogRef.current?.close()}>{t("close")}</button>
                </div>
            </div>}
        </dialog>
        <dialog ref={deleteDialogRef} class="modal">
            {!busy && dialogIndex >= 0 && account !== null && <div class="modal-box">
                <h3 class="font-bold text-lg">{t("enter_name_of_drive")}:</h3>
                <p class="text-xs text-neutral mt-2">{myDrives[dialogIndex].owner}/{myDrives[dialogIndex].name}</p>
                <input type="text" placeholder="name" value={deleteConfirm}
                    class="mt-6 input input-bordered input-primary w-full"
                    onChange={(e) => setDeleteConfirm(e.currentTarget.value)} />
                {dialogError !== null &&
                    <p class="mt-2 text-error">{t("error")}: {setDialogError}</p>}
                <div class="modal-action">
                    {deleteConfirm === myDrives[dialogIndex].owner + "/" + myDrives[dialogIndex].name &&
                        <button class="btn mr-2 btn-primary" onClick={() => {
                            setDialogIndex(-1);
                            setBusy(true);
                            // eslint-disable-next-line max-len
                            fetch(`${sockdriveEndpoint}/fork/delete/${myDrives[dialogIndex].owner}/${myDrives[dialogIndex].name}/${account.token}`, { method: "POST" })
                                .then((r) => r.json())
                                .then((response) => {
                                    if (response.error) {
                                        throw new Error(response.error);
                                    } else {
                                        const newDrives = [...myDrives];
                                        newDrives.splice(dialogIndex, 1);
                                        setMyDrives(newDrives);
                                    }
                                    deleteDialogRef.current?.close();
                                })
                                .catch((e) => {
                                    console.error(e.message);
                                    setDialogError(e.message);
                                    dispatch(uiSlice.actions
                                        .showToast({ message: e.message, intent: "error" }));
                                })
                                .finally(() => {
                                    setBusy(false);
                                });
                        }}>{t("delete")}</button>}
                    <button class="btn" onClick={() => deleteDialogRef.current?.close()}>{t("close")}</button>
                </div>
            </div>
            }
        </dialog >
    </div >;
}
