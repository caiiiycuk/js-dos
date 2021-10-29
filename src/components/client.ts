import { DosInstance } from "emulators-ui/dist/types/js-dos";
import { useState } from "preact/hooks";
import { html } from "../dom";
import { Icons } from "../icons";
import { Props } from "../player-app";
import { downloadFile } from "../dom";

interface ClientProps extends Props {
    class?: string
}

export function Client(props: ClientProps) {
    const [clientRequested, setClientRequested] = useState<boolean>(false);
    if (props.requestClientId === undefined && props.clientId === null) {
        return null;
    }

    if (props.clientId === null) {
        const requestLogin = () => {
            if (props.requestClientId === undefined) {
                return;
            }

            setClientRequested(true);
            props.requestClientId(true)
                .then((clientId) => {
                    setClientRequested(false);
                    props.setClientId(clientId);
                })
                .catch((e) => {
                    setClientRequested(false);
                    console.error(e);
                });
        };

        return html`
            <div class="flex flex-row justify-center items-center ${props.class}">
                <div class="h-6 w-6 text-red-800 animate-pulse mr-2">
                    <${Icons.UserCircle} class="h-6 w-6" />
                </div>
                <div class="border-2 rounded px-4
                    ${clientRequested ? " text-gray-400 border-gray-400" : "text-blue-400 border-blue-400"} 
                    cursor-pointer" onClick=${requestLogin}>
                    Login
                </div>
            </div>
        `;
    }

    const name = props.clientId.id;

    async function onDownload() {
        props.closeSideBar();
        const dos = props.player();

        try {
            await downloadChanges(dos);
        } catch (e) {
            dos.layers.notyf.error("Unexpected error");
            console.error(e);
        }
    }

    /* TODO: show upload dialog
    async function onUpload() {
        props.closeSideBar();
        const dos = props.player();
        const uploadInput = props.options().uploadInput;

        if (uploadInput === undefined) {
            return;
        }

        try {
            await uploadChanges(dos, props.requestClientId as ClientIdSupplier, uploadInput);
        } catch (e) {
            dos.layers.notyf.error("Unexpected error");
            console.error(e);
        }
    }
    */

    return html`
        <div class="flex flex-row justify-center ${props.class}">
            <div class="h-6 w-6 text-green-400 mr-2">
                <${Icons.UserCircle} class="h-6 w-6" />
            </div>
            <div class="flex-shrink overflow-hidden overflow-ellipsis">${name}</div>
            <div class="h-6 w-6 ml-2 cursor-pointer" onClick=${onDownload}>
                <${Icons.Download} class="h-6 w-6" />
            </div>
        </div>
    `;
}


async function downloadChanges(dos: DosInstance): Promise<void> {
    if (!dos.ciPromise) {
        return;
    }

    const ci = await dos.ciPromise;
    const changes = await ci.persist();
    downloadFile(changes, "saves.zip", "application/zip");
}


/* TODO: show upload dialog
async function uploadChanges(dos: DosPlayer,
                             requestClientId: ClientIdSupplier,
                             uploadInput: HTMLInputElement): Promise<void> {
    const bundleUrl = dos.bundleUrl;
    const files = uploadInput.files;
    if (bundleUrl === null || files === null || files.length !== 1) {
        return;
    }

    const file = files[0];

    const data = new Uint8Array(await file.arrayBuffer());
    const clientId = await requestClientId(false);
    if (clientId === null) {
        return;
    }

    if (data.length > 5 * 1024 * 1024) {
        dos.layers.notyf.error("File is too big");
        return;
    }

    await putPersonalBundle(clientId.namespace, clientId.id, bundleUrl, data);
    dos.layers.notyf.success("Uploaded");
}
*/
