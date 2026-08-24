/* eslint-disable new-cap */
import { useEffect, useRef, useState } from "preact/hooks";
import { NonSerializableStore, getNonSerializableStore, useNonSerializableStore } from "../store";
import { useDispatch, useStore } from "react-redux";
import { dosSlice } from "../store/dos";
import { getEntries, getPath as getOPFSHandle, updateOpfsStats } from "../host/opfs";
import { Store } from "../store";

declare const FileExplorer: any;

export async function injectFileExplorer(nonSerializableStore: NonSerializableStore) {
    const url = (nonSerializableStore.options.pathPrefix ?
        nonSerializableStore.options.pathPrefix + "file-explorer.js" :
        "file-explorer.js") + (nonSerializableStore.options.pathSuffix ?? "");
    const cssUrl = (nonSerializableStore.options.pathPrefix ?
        nonSerializableStore.options.pathPrefix + "file-explorer.css" :
        "file-explorer.css") + (nonSerializableStore.options.pathSuffix ?? "");

    const js = await (await fetch(url)).text();
    let css = await (await fetch(cssUrl)).text();

    const cssBase = new URL(cssUrl.substring(0, cssUrl.lastIndexOf("/") + 1), new URL(window.location.href)).toString();
    css = css.replace(/url\('([^']+)'\)/g, (_match, relPath) => {
        return `url('${cssBase}${relPath}')`;
    });

    const jsURL = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
    const cssURL = URL.createObjectURL(new Blob([css], { type: "text/css" }));
    return new Promise<void>((resolve, reject) => {
        if ((window as any).FileExplorer === undefined) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = cssURL;
            link.onload = () => {
                URL.revokeObjectURL(cssURL);
            };
            document.head.appendChild(link);

            const script = document.createElement("script");
            script.onerror = reject;
            script.src = jsURL;
            script.onload = () => {
                URL.revokeObjectURL(jsURL);
                resolve();
            };
            document.body.appendChild(script);
        } else {
            resolve();
        }
    });
}

export function OPFSExplorer() {
    const [injected, setInjected] = useState(false);
    const nonSerializableStore = useNonSerializableStore();
    const dispatch = useDispatch();
    const ref = useRef<HTMLDivElement>(null);
    const store = useStore();

    useEffect(() => {
        if (!injected) {
            injectFileExplorer(nonSerializableStore).then(() => setInjected(true)).catch((e) => {
                dispatch(dosSlice.actions.bndError(e.message));
            });
        }
    }, [injected]);

    useEffect(() => {
        const root = ref.current;
        if (root && injected) {
            FileExplorerElement(root, store as any);
        }
    }, [ref, injected]);

    if (!injected) {
        return <div class="w-full h-full flex justify-center items-center">
            <div class="radial-progress animate-spin" style="--value:70;"></div>
        </div>;
    }

    return <div ref={ref} class="w-full h-full"></div>;
}

type FEEntry = {
    id: string,
    name: string,
    type: "folder" | "file",
    hash: string,
    tooltip: string,
    size?: number,
}

function FileExplorerElement(root: HTMLDivElement, store: Store) {
    const opfsRoot = getNonSerializableStore(store).opfsRoot;
    new FileExplorer(root, {
        initpath: [["", "/"]],

        onselchanged: function(folder: any, selecteditemsmap: Record<string, boolean>, numselected: number) {
            const fe = this;
            if (!fe) {
                return;
            }
            const path = folder.GetPath();
            const pathIds = path.map((seg: string[]) => seg[0]);
            const base = "/" + pathIds.filter(Boolean).join("/");
            if (numselected === 1) {
                const name = Object.keys(selecteditemsmap)[0];
                fe.SetNamedStatusBarText("path", base + (base.endsWith("/") ? "" : "/") + name, 0);
            } else {
                fe.SetNamedStatusBarText("path", base, 0);
            }
        },

        onrefresh: async function(folder: any, _initial: boolean) {
            folder.SetBusyRef(1);
            try {
                const path = folder.GetPath();
                const pathIds = path.map((seg: string[]) => seg[0]);
                this.SetNamedStatusBarText("path", "/" + pathIds.filter(Boolean).join("/"), 0);
                const dir = await getOPFSHandle(pathIds, opfsRoot);
                const opfsEntries = await getEntries(dir);
                const entries: FEEntry[] = opfsEntries.map((entry) => {
                    const feEntry: FEEntry = {
                        id: entry.name,
                        name: entry.name,
                        type: entry.type,
                        hash: entry.name + "_" + entry.type,
                        tooltip: entry.name,
                    };

                    if (entry.size) {
                        feEntry.size = entry.size;
                    }

                    return feEntry;
                });

                folder.SetEntries(entries);
            } catch (e) {
                folder.SetEntries([]);
            }
            folder.SetBusyRef(-1);
        },

        oninitdownload: async function(
            _downloadcallback: (result: any) => void,
            folder: any,
            _ids: string[],
            entries: any[],
        ) {
            try {
                const path = folder.GetPath();
                const pathIds = path.map((seg: string[]) => seg[0]);
                const dir = await getOPFSHandle(pathIds, opfsRoot);

                for (const entry of entries) {
                    if (entry.type === "file") {
                        const fileHandle = await dir.getFileHandle(entry.name);
                        const file = await fileHandle.getFile();
                        const url = URL.createObjectURL(file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = entry.name;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }

                this.StopOperationIndicator();
                this.SetNamedStatusBarText("message", "Download started", 2000);
            } catch (e: any) {
                this.StopOperationIndicator();
                this.SetNamedStatusBarText("message", "Download failed: " + (e.message || e), 3000);
            }
        },

        ondelete: async function(
            deletecallback: (result: boolean | string) => void,
            folder: any,
            _ids: string[],
            entries: any[],
        ) {
            try {
                const path = folder.GetPath();
                const pathIds = path.map((seg: string[]) => seg[0]);
                const dir = await getOPFSHandle(pathIds, opfsRoot);

                for (const entry of entries) {
                    await dir.removeEntry(entry.name, { recursive: true });
                }

                deletecallback(true);
            } catch (e: any) {
                deletecallback(e.message || "Delete failed");
            } finally {
                updateOpfsStats(store);
            }
        },
    });
}
