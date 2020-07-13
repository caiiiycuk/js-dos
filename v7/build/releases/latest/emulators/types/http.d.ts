import { Cache } from "./cache";
export interface XhrOptions {
    cache: Cache;
    method?: string;
    progress?: (total: number, loaded: number) => void;
    data?: string;
    responseType?: XMLHttpRequestResponseType;
}
export declare const HTTPRequest: typeof XhrRequest;
declare function XhrRequest(url: string, options: XhrOptions): Promise<string | ArrayBuffer>;
export {};
