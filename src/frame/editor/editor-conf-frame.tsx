import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";
import { useEffect, useState } from "preact/hooks";
import { sockdriveBackend } from "../../store/init";
import { uiSlice } from "../../store/ui";
import { applySockdriveOptionsIfNeeded, sockdriveImgmount } from "../../player-api-load";

const cleanup = "imgmount\\s+(\\d+)\\s+sockdrive\\s+.*$";

interface Sockdrive {
    num: string,
    backend: string,
    owner: string,
    drive: string,
}

export function EditorConf() {
    const t = useT();
    const bundleConfig = useSelector((state: State) => state.editor.bundleConfig);
    const account = useSelector((state: State) => state.auth.account);
    const backend = useSelector((state: State) => state.dos.backend);
    const { sockdriveEndpoint, sockdriveWssEndpoint } = useSelector((state: State) =>
        sockdriveBackend[state.init.sockdriveBackendName] ??
        sockdriveBackend["js-dos"]);
    const dispatch = useDispatch();
    const [myDrives, setMyDrives] = useState<{ name: string, owner: string }[]>([]);

    useEffect(() => {
        if (!account) {
            setMyDrives([]);
        } else {
            fetch(sockdriveEndpoint + "/list/drives/" + account.token)
                .then((r) => r.json())
                .then(setMyDrives)
                .catch(console.error);
        }
    }, [account?.token, sockdriveEndpoint]);

    function parseSockDrives(conf: string) {
        const drives: { [num: string]: Sockdrive } = {};
        let m: RegExpExecArray | null;
        while (m = sockdriveImgmount.exec(conf)) {
            /* eslint-disable-next-line no-unused-vars */
            const [_, num, backend, owner, drive] = m;
            drives[num] = {
                num,
                backend,
                owner,
                drive,
            };
        }
        return drives;
    }

    const [sockdrives, setSockdrives] = useState<{ [num: string]: Sockdrive }>(
        parseSockDrives(bundleConfig?.dosboxConf ?? ""));

    function setSockdrivesAndUpdateConf(sockdrives: { [num: string]: Sockdrive }) {
        setSockdrives(sockdrives);
        if (bundleConfig) {
            const parts: string[] = [];
            for (const next of Object.values(sockdrives)) {
                if (next.owner.length > 0 && next.drive.length > 0) {
                    parts.push(`imgmount ${next.num} sockdrive ${next.backend} ${next.owner} ${next.drive}`);
                }
            }

            let contents = bundleConfig.dosboxConf;
            contents = contents.replaceAll(new RegExp(cleanup, "gm"), "");
            if (parts.length > 0) {
                let start = contents.indexOf("[autoexec]");
                if (start === -1) {
                    start = contents.length;
                } else {
                    start += 10;
                }
                const footer = contents.substring(start);
                contents = contents.substring(0, start);
                contents += "\n" + parts.join("\n") + "\n" + footer.trim();
            }
            updateDosboxConf(contents);
        }
    }

    function changeConfig(contents: string) {
        setSockdrives(parseSockDrives(contents));
        updateDosboxConf(contents);
    }

    function updateDosboxConf(newConf: string) {
        applySockdriveOptionsIfNeeded(newConf, dispatch);
        dispatch(dosSlice.actions.mouseCapture(newConf.indexOf("autolock=true") > 0));
        dispatch(editorSlice.actions.dosboxConf(newConf));
    }

    if (bundleConfig === null) {
        return null;
    }

    return <div class="editor-conf-frame flex flex-col flex-grow w-full gap-2">
        <div class="">{t("dosboxconf_template")}</div>
        <div class="flex flex-row flex-wrap items-center gap-2">
            {dosboxconf
                .map(({ name, backend, contents }) => {
                    return <button class="btn btn-sm"
                        onClick={() => {
                            dispatch(dosSlice.actions.dosBackend(backend === "dosboxX" ? "dosboxX" : "dosbox"));
                            changeConfig(contents.replaceAll("{wss-makevm}", sockdriveWssEndpoint));
                        }}>
                        {name}
                    </button>;
                })}
        </div>
        {backend === "dosboxX" && <>
            <button class="btn btn-ghost btn-xs self-start" target="_blank"
                onClick={() => dispatch(uiSlice.actions.frameFatDrives())}>
                {t("net_drives")}:
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m12.75 15 3-3m0 0-3-3m3
                         3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
            {["2", "3"].map((num) => {
                return <div class="flex flex-row justify-start items-center gap-3 w-full">
                    <p>{num === "2" ? "C:" : "D:"}</p>
                    <div class="flex flex-col gap-2">
                        <div class="flex flex-row gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488
                                    0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963
                                    0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3
                                    3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <input class="input input-xs" type="text" value={sockdrives[num]?.owner ?? ""}
                                onChange={(e) => {
                                    const newSockdrives = { ...sockdrives };
                                    newSockdrives[num] = {
                                        num,
                                        backend: sockdrives[num]?.backend ?? sockdriveWssEndpoint,
                                        owner: e.currentTarget.value,
                                        drive: sockdrives[num]?.drive ?? "",
                                    };
                                    setSockdrivesAndUpdateConf(newSockdrives);
                                }}></input>
                        </div>
                        <div class="flex flex-row gap-1 items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694
                                    4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75
                                    4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25
                                    4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5
                                    0v3.75C20.25 16.153
                                    16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25
                                    4.125s-8.25-1.847-8.25-4.125" />
                            </svg>

                            <input class="input input-xs" type="text" value={sockdrives[num]?.drive ?? ""}
                                onChange={(e) => {
                                    const newSockdrives = { ...sockdrives };
                                    newSockdrives[num] = {
                                        num,
                                        backend: sockdrives[num]?.backend ?? sockdriveWssEndpoint,
                                        owner: sockdrives[num]?.owner ?? "",
                                        drive: e.currentTarget.value,
                                    };
                                    setSockdrivesAndUpdateConf(newSockdrives);
                                }}></input>
                        </div>
                    </div>
                    <div class="dropdown dropdown-bottom dropdown-end">
                        <button tabIndex={0} role="button" class="btn btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5
                                        0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25
                                        2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25
                                        0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0
                                        1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                            </svg>
                        </button>
                        <ul tabIndex={0} class="dropdown-content z-[1] menu p-2 shadow bg-base-100
                            rounded-box w-52 max-h-80 overflow-auto">
                            {myDrives.map(({ name, owner }) => {
                                return <li onClick={(e) => {
                                    const newSockdrives = { ...sockdrives };
                                    newSockdrives[num] = {
                                        num,
                                        owner,
                                        backend: sockdriveWssEndpoint,
                                        drive: name,
                                    };
                                    setSockdrivesAndUpdateConf(newSockdrives);
                                    e.currentTarget.parentElement!.blur();
                                }}><a>{name}</a></li>;
                            })}
                        </ul>
                    </div>
                    <button class="btn btn-sm" onClick={() => {
                        const newSockdrives = { ...sockdrives };
                        delete newSockdrives[num];
                        setSockdrivesAndUpdateConf(newSockdrives);
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58
                                4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.211.497-.33.795-.33H19.5a2.25
                                2.25 0 0 1 2.25 2.25v10.5a2.25 2.25 0 0 1-2.25 2.25h-9.284c-.298 0-.585-.119-.795-.33Z"
                            />
                        </svg>
                    </button>
                </div>;
            })}
        </>}
        <textarea class="flex-grow" value={bundleConfig.dosboxConf}
            onChange={(e) => changeConfig(e.currentTarget?.value ?? "")} />
    </div>;
}
