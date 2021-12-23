export declare function send(method: "get" | "post" | "head" | "put", url: string, responseType: XMLHttpRequestResponseType, body?: string | ArrayBuffer, onprogress?: (progress: number) => void, headers?: {
    [name: string]: string;
}): Promise<string | ArrayBuffer>;
export declare function postObject(url: string, data?: string | ArrayBuffer): Promise<any>;
export declare function getObject(url: string): Promise<any>;
export declare function post(url: string, responseType: XMLHttpRequestResponseType, data?: string | ArrayBuffer): Promise<string | ArrayBuffer>;
