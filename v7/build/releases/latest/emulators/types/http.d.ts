export interface XhrOptions {
    method?: string;
    progress?: (total: number, loaded: number) => void;
    data?: string;
    responseType?: XMLHttpRequestResponseType;
}
export declare const httpRequest: typeof XhrRequest;
declare function XhrRequest(url: string, options: XhrOptions): Promise<string | ArrayBuffer>;
export {};
