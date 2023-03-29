import { useState } from "preact/hooks";
import { nonSerializableStore } from "../non-serializable-store";

export function SaveButton(props: {
    class?: string,
}) {
    const [busy, setBusy] = useState<boolean>(false);

    if (nonSerializableStore.loadedBundle === null ||
        nonSerializableStore.loadedBundle.bundleChangesUrl === null) {
        return null;
    }

    async function onClick() {
        if (busy) {
            return;
        }

        const ci = nonSerializableStore.ci;
        const changesUrl = nonSerializableStore.loadedBundle?.bundleChangesUrl;

        if (ci === null || !changesUrl) {
            return;
        }

        setBusy(true);
        try {
            const changes = await ci.persist(true);
            // TODO: check if empty
            nonSerializableStore.cache.put(changesUrl, changes);
        } catch (e: any) {
            // TODO: show toast
            console.error(e);
        } finally {
            setBusy(false);
        }
    }

    return <div class={"save-button sidebar-button overflow-hidden " +
        (busy ? " sidebar-highlight " : "") +
        props.class} onClick={onClick}>
        <div class="w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="1.5" stroke="currentColor" class="w-full h-full">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0
                 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565
                 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>

            { busy && <div class="sidebar-badge" /> }
        </div>
    </div >;
}
