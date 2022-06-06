export const uploadsS3Bucket = "doszone-uploads";

const uploadsS3Url = "https://doszone-uploads.s3.dualstack.eu-central-1.amazonaws.com";

export function getPersonalBundleKey(namespace: string, id: string,
                                     bundleUrl: string, publishToken: string | undefined): string {
    if (publishToken !== undefined && bundleUrl.startsWith(uploadsS3Url)) {
        return bundleUrl.substring(uploadsS3Url.length + 1);
    }

    const index = bundleUrl.lastIndexOf("/");
    const basename = bundleUrl.substr(index + 1);
    if (namespace === "doszone") {
        return "personal/" + id + "/" + basename;
    } else {
        return "personal-v2/" + namespace + "/" + id + "/" + basename;
    }
}

export function getPersonalBundleUrl(namespace: string, id: string, bundleUrl: string,
                                     publishToken: string | undefined): string {
    const personalBundleKey = getPersonalBundleKey(namespace, id, bundleUrl, publishToken);
    return uploadsS3Url + "/" + personalBundleKey;
}
