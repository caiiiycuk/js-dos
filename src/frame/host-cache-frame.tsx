import { useEffect, useState } from "preact/hooks";
import { useDispatch } from "react-redux";
import { useT } from "../i18n";
import { loadBundleFromUrl } from "../load";
import { nonSerializableStore } from "../non-serializable-store";
import { dosSlice } from "../store/dos";
import { uiSlice } from "../store/ui";

export function HostCacheFrame() {
    const [cached, setCached] = useState<string[] | null>(null);
    const t = useT();
    const dispatch = useDispatch();

    useEffect(() => {
        nonSerializableStore.cache.keys()
            .then(setCached)
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

    function deleteBundle(url: string) {
        nonSerializableStore.cache
            .del(url).catch(console.error);

        setCached(cached!.filter((v) => v !== url));
    }

    return <div class="host-cache-frame frame-root items-start px-4">
        <div class="w-full">
            <table class="table table-compact w-full">
                <thead>
                    <tr>
                        <th>URL</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cached.map((url) => {
                        return <tr>
                            <td class="url cursor-pointer underline hover:text-accent"
                                onClick={() => loadBundle(url)}>{url}</td>
                            <td class="cursor-pointer text-error hover:text-accent"
                                onClick={() => deleteBundle(url)}>{t("delete")}</td>
                        </tr>;
                    })}
                </tbody>
            </table>
        </div>
    </div>;
}
