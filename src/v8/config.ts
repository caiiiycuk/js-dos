export const apiEndpoint = "https://d5dn8hh4ivlobv6682ep.apigw.yandexcloud.net";
export const netEndpoint = "wss://net.js-dos.com:444";
export const netToken = "mp";
export const netSecret = "32r09j23f";
export const brCdn = "https://br.cdn.dos.zone";

export const actualWsVersion = 5;

export function isDhry2Bundle(url: string | null) {
    return url && (url.endsWith("/b4b5275904d86a4ab8a20917b2b7e34f0df47bf7.jsdos") ||
        url.endsWith("/dhry2.jsdos"));
}
