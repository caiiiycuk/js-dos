import { MemStorage } from "./mem-storage";

const MAX_VALUE_SIZE = 1024;
const NEXT_PART_SYMBOL = "@";
const NEXT_PART_SYFFIX = ".";

export class LStorage implements Storage {
    private backend: Storage;
    length: number;
    prefix: string;

    constructor(backend: Storage | undefined, prefix: string) {
        this.prefix = prefix;

        try {
            this.backend = backend || localStorage;
            this.testBackend();
        } catch (e) {
            this.backend = new MemStorage();
        }

        this.length = this.backend.length;

        if (typeof this.backend.sync === "function") {
            (this as any).sync = (callback: any) => {
                this.backend.sync(callback);
            };
        }
    }

    testBackend() {
        const testKey = this.prefix + ".test.record";
        const testValue = "123";
        this.backend.setItem(testKey, testValue);
        const readedValue = this.backend.getItem(testKey);
        this.backend.removeItem(testKey);
        const valid = readedValue === testValue && this.backend.getItem(testKey) === null;

        if (!valid) {
            throw new Error("Storage backend is not working properly");
        }
    }

    setLocalStoragePrefix(prefix: string) {
        this.prefix = prefix;
    }

    clear(): void {
        if (!this.backend.length) {
            return;
        }

        const toRemove: string[] = [];
        for (let i = 0; i < this.backend.length; ++i) {
            const next = this.backend.key(i);
            if (next && next.startsWith(this.prefix)) {
                toRemove.push(next);
            }
        }

        for (const next of toRemove) {
            this.backend.removeItem(next);
        }
        this.length = this.backend.length;
    }

    key(index: number): string | null {
        return this.backend.key(index);
    }

    setItem(key: string, value: string): void {
        if (!value || value.length === undefined || value.length === 0) {
            this.writeStringToKey(key, "");
            return;
        }

        let offset = 0;
        while (offset < value.length) {
            let substr = value.substr(offset, MAX_VALUE_SIZE);
            offset += substr.length;

            if (offset < value.length) {
                substr += NEXT_PART_SYMBOL;
            }

            this.writeStringToKey(key, substr);
            key += NEXT_PART_SYFFIX;
        }
    }

    getItem(key: string): string | null {
        let value = this.readStringFromKey(key);
        if (value === null) {
            return null;
        }

        if (value.length === 0) {
            return value;
        }

        while (value[value.length - 1] === NEXT_PART_SYMBOL) {
            value = value.substr(0, value.length - 1);
            key += NEXT_PART_SYFFIX;
            const next = this.readStringFromKey(key);
            value += next === null ? "" : next;
        }

        return value;
    }

    removeItem(key: string): void {
        this.backend.removeItem(this.prefix + key);
        this.length = this.backend.length;
    }

    private writeStringToKey(key: string, value: string) {
        this.backend.setItem(this.prefix + key, value);
        this.length = this.backend.length;
    }

    private readStringFromKey(key: string) {
        return this.backend.getItem(this.prefix + key);
    }
}
