import { uploadsS3Url, uploadsS3Bucket, uploadNamspace, presignPut } from "./config";

function getPersonalBundleKey(id: string,
                              bundleUrl: string): string {
    const index = bundleUrl.lastIndexOf("/");
    const basename = bundleUrl.substring(index + 1);
    return "personal-v2/" + uploadNamspace + "/" + id + "/" + basename;
}

export function getChangesUrlPrefix(id: string): string {
    return uploadsS3Url + "/" + uploadsS3Bucket + "/" + "personal-v2" + "/" + uploadNamspace + "/" + id + "/";
}

export function getChangesUrl(id: string, bundleUrl: string): string {
    const personalBundleKey = getPersonalBundleKey(id, bundleUrl);
    return uploadsS3Url + "/" + uploadsS3Bucket + "/" + personalBundleKey;
}

export async function putChanges(bundleUrl: string,
                                 data: Uint8Array): Promise<void> {
    let response = await fetch(presignPut + "?bundleUrl=" + encodeURIComponent(bundleUrl));
    const result = await response.json();

    if (!result.success) {
        throw new Error("Unable to put personal bundle");
    }

    const post = result.post as {
        url: string,
        fields: {
            Policy: string,
            "X-Amz-Algorithm": string,
            "X-Amz-Credential": string,
            "X-Amz-Date": string,
            "X-Amz-Signature": string,
            bucket: string,
            key: string,
        },
    };

    const formData = new FormData();
    Object.entries(post.fields).forEach(([k, v]) => {
        formData.append(k, v);
    });
    formData.append("acl", "public-read");
    formData.append("file", new Blob([data]));

    response = await fetch(post.url, {
        method: "post",
        body: formData,
    });

    if (response.status !== 200 && response.status !== 204) {
        throw new Error("Unable to put changes: " + response.statusText);
    }
}
