import { getPersonalBundleUrl as impl } from "../../../v7-services/src/personal";
import { send, postObject } from "../../xhr";

import { personalAcl, personalPut } from "./v7-config";

declare const zip: any;

export function getPersonalBundleUrl(namespace: string, id: string, bundleUrl: string): string {
    return impl(namespace, id, bundleUrl, undefined);
}

export async function putPersonalBundle(namespace: string,
                                        id: string,
                                        bundleUrl: string,
                                        data: Uint8Array): Promise<void> {
    const isEmpty = await isEmptyArchive(data);
    if (isEmpty) {
        console.warn("Ignore empty changes archive");
        return;
    }

    const result = await postObject(personalPut + "?namespace=" + namespace + "&id=" + id +
        "&bundleUrl=" + encodeURIComponent(bundleUrl));

    if (!result.success) {
        throw new Error("Unable to put personal bundle");
    }

    const payload = JSON.parse(result.payload);
    const headers = payload.signature as { [name: string]: string };
    const url = payload.url as string;

    headers["x-amz-content-sha256"] = "UNSIGNED-PAYLOAD";
    await send("put",
        url,
        "text",
        data.buffer,
        undefined,
        headers);

    if (!(await postObject(personalAcl + "?namespace=" + namespace + "&id=" + id +
        "&bundleUrl=" + bundleUrl)).success) {
        throw new Error("Can't set ACL to personal bundle");
    }
}

async function isEmptyArchive(data: Uint8Array): Promise<boolean> {
    const zipReader = new zip.ZipReader(new zip.Uint8ArrayReader(data), {
        useWebWorkers: false,
    });
    const entries = await zipReader.getEntries();
    let empty = true;
    for (const next of entries) {
        empty = next.directory === true;
        if (!empty) {
            break;
        }
    }
    zipReader.close();
    return empty;
}
