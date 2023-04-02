import { uploadsS3Url, uploadsS3Bucket, uploadNamspace } from "./config";

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
