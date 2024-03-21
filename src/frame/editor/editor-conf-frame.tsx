import { useDispatch, useSelector } from "react-redux";
import { useT } from "../../i18n";
import { State } from "../../store";
import { editorSlice } from "../../store/editor";
import { dosboxconf } from "./defaults";
import { dosSlice } from "../../store/dos";
import { useEffect, useState } from "preact/hooks";
import { makevmEndpoint, makevmWssEndpoint } from "../../v8/config";

const imgmount = "imgmount\\s+(\\d+)\\s+sockdrive\\s+([^\\s]+)\\s+([^\\s]+)\\s+([^\\s]+)\\s*$";

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
    const dispatch = useDispatch();
    const [myDrives, setMyDrives] = useState<{ name: string, owner: string }[]>([]);

    useEffect(() => {
        if (!account || !account.token) {
            setMyDrives([]);
        } else {
            fetch(makevmEndpoint + "/list/drives/" + account.token.access_token)
                .then((r) => r.json())
                .then(setMyDrives);
        }
    }, [account?.token, makevmEndpoint]);

    function parseSockDrives(conf: string) {
        const drives: { [num: string]: Sockdrive } = {};
        const re = new RegExp(imgmount, "gm");
        let m: RegExpExecArray | null;
        while (m = re.exec(conf)) {
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
            let contents = bundleConfig.dosboxConf;
            contents = contents.replaceAll(new RegExp(imgmount, "gm"), "");
            let start = contents.indexOf("[autoexec]");
            if (start === -1) {
                start = contents.length;
            } else {
                start += 10;
            }
            const footer = contents.substring(start);
            contents = contents.substring(0, start) + "\necho off\n";
            for (const next of Object.values(sockdrives)) {
                contents += `imgmount ${next.num} sockdrive ${next.backend} ${next.owner} ${next.drive}\n`;
            }
            contents += "\necho on\n" + footer;
            updateDosboxConf(contents);
        }
    }

    function changeConfig(contents: string) {
        setSockdrives(parseSockDrives(contents));
        updateDosboxConf(contents);
    }

    function updateDosboxConf(newConf: string) {
        dispatch(dosSlice.actions.mouseCapture(newConf.indexOf("autolock=true") > 0));
        dispatch(editorSlice.actions.dosboxConf(newConf));
        dispatch(dosSlice.actions.dosBackendLocked(newConf.indexOf("sockdrive") >= 0));
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
                            changeConfig(contents);
                        }}>
                        {name}
                    </button>;
                })}
        </div>
        {backend === "dosboxX" && <>
            <a href="https://make-vm.com" class="link self-start" target="_blank">{t("net_drives")}:</a>
            {["2", "3"].map((num) => {
                return <div class="flex flex-row justify-center items-center gap-2">
                    <p>{num === "2" ? "C:" : "D:"}</p>
                    <input class="input input-xs w-20" type="text" value={sockdrives[num]?.owner ?? ""}
                        onChange={(e) => {
                            const newSockdrives = { ...sockdrives };
                            newSockdrives[num] = {
                                num,
                                backend: sockdrives[num]?.backend ?? makevmWssEndpoint,
                                owner: e.currentTarget.value,
                                drive: sockdrives[num]?.drive ?? "",
                            };
                            setSockdrivesAndUpdateConf(newSockdrives);
                        }}></input>
                    <input class="input input-xs w-20" type="text" value={sockdrives[num]?.drive ?? ""}
                        onChange={(e) => {
                            const newSockdrives = { ...sockdrives };
                            newSockdrives[num] = {
                                num,
                                backend: sockdrives[num]?.backend ?? makevmWssEndpoint,
                                owner: sockdrives[num]?.owner ?? "",
                                drive: e.currentTarget.value,
                            };
                            setSockdrivesAndUpdateConf(newSockdrives);
                        }}></input>
                    <div class="dropdown dropdown-bottom dropdown-end">
                        <div tabIndex={0} role="button" class="btn btn-xs m-1">+</div>
                        <ul tabIndex={0} class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                            {myDrives.map(({ name, owner }) => {
                                return <li onClick={(e) => {
                                    const newSockdrives = { ...sockdrives };
                                    newSockdrives[num] = {
                                        num,
                                        owner,
                                        backend: makevmWssEndpoint,
                                        drive: name,
                                    };
                                    setSockdrivesAndUpdateConf(newSockdrives);
                                    e.currentTarget.parentElement!.blur();
                                }}><a>{name}</a></li>;
                            })}
                        </ul>
                    </div>
                    <button class="btn btn-xs join-item" onClick={() => {
                        const newSockdrives = { ...sockdrives };
                        delete newSockdrives[num];
                        setSockdrivesAndUpdateConf(newSockdrives);
                    }}>X</button>
                </div>;
            })}
        </>}
        <textarea class="flex-grow" value={bundleConfig.dosboxConf}
            onChange={(e) => changeConfig(e.currentTarget?.value ?? "")} />
    </div>;
}
