export const endpoint = "https://v8.js-dos.com";
export const uploadsS3Bucket = "doszone-uploads";
export const uploadsS3Url = "https://storage.yandexcloud.net";
export const uploadNamspace = "dzapi";

export const apiEndpoint = "https://d5dn8hh4ivlobv6682ep.apigw.yandexcloud.net";
export const presignPut = apiEndpoint + "/presign-put";
export const presignDelete = apiEndpoint + "/presign-delete";

export const cloudEndpoint = "https://cloud.js-dos.com";
export const tokenGet = cloudEndpoint + "/token/get";

export const brCdn = "https://br.cdn.dos.zone";

export const cancelSubscriptionPage = {
    en: "https://v8.js-dos.com/cancel-your-subscription/",
    ru: "https://v8.js-dos.com/ru/cancel-your-subscription/",
};

export const actualWsVersion = 5;

export function isDhry2Bundle(url: string | null) {
    return url && (url.endsWith("/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos") ||
        url.endsWith("/dhry2.jsdos"));
}
