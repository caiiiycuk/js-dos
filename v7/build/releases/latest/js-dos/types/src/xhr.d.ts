export declare function SEND(method: "get" | "post" | "head" | "put", url: string, responseType: XMLHttpRequestResponseType, body?: string | ArrayBuffer, onprogress?: (progress: number) => void, headers?: {
    [name: string]: string;
}): Promise<string | ArrayBuffer>;
export declare function POST_OBJECT(url: string, data?: string | ArrayBuffer): Promise<any>;
export declare function _POST(url: string, responseType: XMLHttpRequestResponseType, data?: string | ArrayBuffer): Promise<string | ArrayBuffer>;
