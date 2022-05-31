import { html } from "../dom";
import { Props } from "../player-app";
import { Icons } from "../icons";

export function SyncMouseControl(props: Props) {
    function sync(e: Event) {
        props.player().ciPromise?.then((ci) => {
            ci.sendMouseSync();
        });
        e.stopPropagation();
        e.preventDefault();
    }

    if (props.autolock) {
        return;
    }

    return html`
        <div class="flex flex-col items-center bg-gray-200 my-2 py-2 rounded">
            <div class="text-gray-400 h-6 w-4 border-b border-gray-400">
                <${Icons.Cursor} class="h-4 w-4" />
            </div>
            <div class="cursor-pointer h-6 w-6 mt-2" onClick=${sync}>
                <${Icons.Refresh} class="h-6 w-6" />
            </div>
        </div>
    `;
}
