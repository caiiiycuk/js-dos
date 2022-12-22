export class MemStorage implements Storage {
    length = 0;

    private storage: {[key: string]: string} = {};

    setItem(key: string, value: string): void {
        this.storage[key] = value;
        this.length = Object.keys(this.storage).length;
    }

    getItem(key: string): string | null {
        const value = this.storage[key];
        return value === undefined ? null : value;
    }

    removeItem(key: string): void {
        delete this.storage[key];
        this.length = Object.keys(this.storage).length;
    }

    key(index: number): string | null {
        const keys = Object.keys(this.storage);
        return keys[index] === undefined ? null : keys[index];
    }

    clear() {
        this.length = 0;
        this.storage = {};
    }
}
