export declare class LStorage implements Storage {
    private backend;
    length: number;
    prefix: string;
    constructor(backend: Storage | undefined, prefix: string);
    testBackend(): void;
    setLocalStoragePrefix(prefix: string): void;
    clear(): void;
    key(index: number): string | null;
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    private writeStringToKey;
    private readStringFromKey;
}
