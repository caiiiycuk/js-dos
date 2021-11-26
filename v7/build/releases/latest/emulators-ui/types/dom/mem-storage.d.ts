export declare class MemStorage implements Storage {
    length: number;
    private storage;
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    key(index: number): string | null;
    clear(): void;
}
