export const uploadsS3Bucket = "doszone-uploads";

const uploadsS3Url = "https://doszone-uploads.s3.dualstack.eu-central-1.amazonaws.com";

export function getPersonalBundleKey(namespace: string, id: string, bundleUrl: string): string {
    const index = bundleUrl.lastIndexOf("/");
    const basename = bundleUrl.substr(index + 1);
    if (namespace === "doszone") {
        return "personal/" + id + "/" + basename;
    } else {
        return "personal-v2/" + namespace + "/" + id + "/" + basename;
    }
}

export function getPersonalBundleUrl(namespace: string, id: string, bundleUrl: string): string {
    const personalBundleKey = getPersonalBundleKey(namespace, id, bundleUrl);
    return uploadsS3Url + "/" + personalBundleKey;
}
