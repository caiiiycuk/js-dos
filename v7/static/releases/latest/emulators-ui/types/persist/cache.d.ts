export interface Cache {
    put: (key: string, data: string | ArrayBuffer) => Promise<void>;
    get: (key: string, defaultValue?: string | ArrayBuffer) => Promise<string | ArrayBuffer>;
    forEach: (each: (key: string, value: any) => void, onend: () => void) => void;
    close: () => void;
}
export declare function makeCache(version: string, logger: {
    onErr(...args: any[]): any;
}): Promise<Cache>;
