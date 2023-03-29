/* eslint @typescript-eslint/no-unused-vars: 0 */

export interface Cache {
    readonly owner: string;
    put: (key: string, data: Uint8Array) => Promise<void>;
    get: (key: string, defaultValue?: Uint8Array) => Promise<Uint8Array>;
    del: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
    forEach: (each: (key: string, value: Uint8Array) => void) => Promise<void>;
    close: () => void;
}

export class CacheNoop implements Cache {
    public owner = "";

    public close() {
    }

    public put(key: string, data: Uint8Array): Promise<void> {
        return Promise.resolve();
    }

    public get(key: string, defaultValue?: Uint8Array): Promise<Uint8Array> {
        if (defaultValue !== undefined) {
            return Promise.resolve(defaultValue);
        }
        return Promise.reject(new Error("Cache is not supported on this host"));
    }

    public del(key: string): Promise<void> {
        return Promise.resolve();
    }

    public keys(): Promise<string[]> {
        return Promise.resolve([]);
    }

    public forEach(each: (key: string, value: Uint8Array) => void) {
        return Promise.resolve();
    }
}

class LCache implements Cache {
    public owner: string;
    private storeName = "files";
    private indexedDB: IDBFactory;
    private db: IDBDatabase | null = null;

    constructor(owner: string,
        onready: (cache: Cache) => void,
        onerror: (msg: string) => void) {
        this.owner = owner;
        this.indexedDB = (typeof window === "undefined" ? undefined : window.indexedDB ||
            (window as any).mozIndexedDB ||
            (window as any).webkitIndexedDB || (window as any).msIndexedDB) as any;

        if (!this.indexedDB) {
            onerror("Indexed db is not supported on this host");
            return;
        }

        try {
            const openRequest = this.indexedDB.open("js-dos-cache (" + owner + ")", 1);
            openRequest.onerror = (event) => {
                onerror("Can't open cache database: " + openRequest.error?.message);
            };
            openRequest.onsuccess = (event) => {
                this.db = openRequest.result;
                onready(this);
            };
            openRequest.onupgradeneeded = (event) => {
                try {
                    this.db = openRequest.result;
                    this.db.onerror = (event) => {
                        onerror("Can't upgrade cache database");
                    };

                    const objectStore = this.db.createObjectStore(this.storeName);
                    objectStore.createIndex("key", "", {
                        unique: true,
                        multiEntry: false,
                    });
                } catch (e) {
                    onerror("Can't upgrade cache database");
                }
            };
        } catch (e: any) {
            onerror("Can't open cache database: " + e.message);
        }
    }

    public close() {
        if (this.db !== null) {
            this.db.close();
            this.db = null;
        }
    }

    public put(key: string, data: Uint8Array): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.db === null) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readwrite");
            const request = transaction.objectStore(this.storeName).put(data.buffer, key);
            request.onerror = () => reject;
            request.onsuccess = () => resolve();
        });
    }

    public del(key: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.db === null) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readwrite");
            const request = transaction.objectStore(this.storeName).delete(key);
            request.onerror = () => reject;
            request.onsuccess = () => resolve();
        });
    }

    public get(key: string, defaultValue?: Uint8Array): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            function rejectOrResolve(message: string) {
                if (defaultValue === undefined) {
                    reject(new Error(message));
                } else {
                    resolve(defaultValue);
                }
            }


            if (this.db === null) {
                rejectOrResolve("db is not initalized");
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readonly");
            const request = transaction.objectStore(this.storeName).get(key) as IDBRequest<ArrayBuffer>;
            request.onerror = () => reject(new Error("Can't read value for key '" + key + "'"));
            request.onsuccess = () => {
                if (request.result) {
                    resolve(new Uint8Array(request.result));
                } else {
                    rejectOrResolve("Result is empty for key '" + key + "', result: " + request.result);
                }
            };
        });
    }

    public keys(): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            if (this.db === null) {
                resolve([]);
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readonly");
            const request = transaction.objectStore(this.storeName).index("key").getAllKeys();
            request.onerror = () => reject;
            request.onsuccess = (event) => {
                const keys = (event.target as any).result as string[];
                resolve(keys);
            };
        });
    }

    public forEach(each: (key: string, value: Uint8Array) => void): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.db === null) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readonly");
            const request = transaction.objectStore(this.storeName).openCursor();
            request.onerror = () => reject;
            request.onsuccess = (event) => {
                const cursor = (event.target as any).result as IDBCursorWithValue;
                if (cursor) {
                    each(cursor.key.toString(), new Uint8Array(cursor.value));
                    cursor.continue();
                } else {
                    resolve();
                }
            };
        });
    }
}

export function getCache(owner: string): Promise<Cache> {
    return new Promise((resolve) => {
        new LCache(owner, resolve, (msg: string) => {
            console.error("Can't open IndexedDB cache", msg);
            resolve(new CacheNoop());
        });
    });
}
