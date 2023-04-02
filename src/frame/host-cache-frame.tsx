import { useEffect, useState } from "preact/hooks";
import { useDispatch } from "react-redux";
import { getChangesUrlPrefix } from "../v8/changes";
import { downloadArrayToFs, downloadUrlToFs } from "../download-file";
import { useT } from "../i18n";
import { loadBundleFromUrl } from "../load";
import { nonSerializableStore } from "../non-serializable-store";
import { dosSlice } from "../store/dos";
import { uiSlice } from "../store/ui";

export function HostCacheFrame() {
    const [cached, _setCached] = useState<string[] | null>(null);
    const [saves, setSaves] = useState<{ [url: string]: string }>({});
    const t = useT();
    const dispatch = useDispatch();

    function setCached(cached: string[], owner: string) {
        const changesPrefix = getChangesUrlPrefix(owner);
        const saves: { [url: string]: string } = {};
        cached = cached.filter((next) => {
            if (next.startsWith(changesPrefix)) {
                const gameUrl = decodeURIComponent(next.substring(next.lastIndexOf("/") + 1));
                saves[gameUrl.substring(0, gameUrl.length - ".zip".length)] = next;
                return false;
            } else {
                return true;
            }
        });
        _setCached(cached);
        setSaves(saves);
    }

    useEffect(() => {
        const cache = nonSerializableStore.cache;
        cache.keys()
            .then((cached) => setCached(cached, cache.owner))
            .catch(console.error);
    }, []);

    if (cached === null) {
        return <div class="host-cache-frame frame-root items-center my-4">
            <div class="radial-progress animate-spin" style="--value:70;"></div>
        </div>;
    }

    async function loadBundle(url: string) {
        dispatch(uiSlice.actions.frameNone());

        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (e: any) {
            console.error(e);
            return;
        }

        try {
            await loadBundleFromUrl(validUrl.toString(), dispatch);
        } catch (e: any) {
            dispatch(dosSlice.actions.bndError(e.message ?? "unexpected error"));
        }
    }

    async function saveBundle(url: string) {
        try {
            const content = await nonSerializableStore.cache
                .get(url);
            const name = url.substring(url.lastIndexOf("/") + 1);
            downloadArrayToFs(name.length === 0 ? "bundle.jsdos" : name, content);
        } catch (e) {
            // ignore
        }
    }

    async function saveChanges(url: string, gameUrl: string) {
        try {
            const name = gameUrl.substring(url.lastIndexOf("/") + 1);
            downloadUrlToFs((name.length === 0 ? "bundle.jsdos" : name) +
                "chages.zip", url);
        } catch (e) {
            // ignore
        }
    }

    function deleteBundle(url: string) {
        nonSerializableStore.cache
            .del(url).catch(console.error);

        _setCached(cached!.filter((v) => v !== url));
    }

    return <div class="host-cache-frame frame-root items-start px-4">
        <div class="w-full">
            <table class="table table w-full">
                <thead>
                    <tr>
                        <th>{t("stored")}</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cached.map((url) => {
                        return <>
                            <tr>
                                <td class="url cursor-pointer underline hover:text-accent"
                                    onClick={() => loadBundle(url)}>{url}</td>
                                <td >
                                    {saves[url] !== undefined &&
                                        <div class="cursor-pointer text-primary underline hover:text-accent"
                                            onClick={() => saveChanges(saves[url], url)}>{t("changes")}</div>
                                    }
                                    <div class="cursor-pointer hover:text-accent"
                                        onClick={() => saveBundle(url)}>{t("download")}</div>
                                    <div class="cursor-pointer hover:text-accent"
                                        onClick={() => deleteBundle(url)}>{t("delete")}</div>
                                </td>
                            </tr>
                        </>;
                    })}
                </tbody>
            </table>
        </div>
    </div>;
}
