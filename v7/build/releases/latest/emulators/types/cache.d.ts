export interface Cache {
    put: (key: string, data: string | ArrayBuffer) => Promise<void>;
    get: (key: string, defaultValue?: string | ArrayBuffer) => Promise<string | ArrayBuffer>;
    forEach: (each: (key: string, value: any) => void, onend: () => void) => void;
    close: () => void;
}
export declare class CacheNoop implements Cache {
    close(): void;
    put(key: string, data: string | ArrayBuffer): Promise<void>;
    get(key: string, defaultValue?: string | ArrayBuffer): Promise<string | ArrayBuffer>;
    forEach(each: (key: string, value: any) => void, onend: () => void): void;
}
export declare function CacheDb(version: string, logger: {
    onErr(...args: any[]): any;
}): Promise<Cache>;
