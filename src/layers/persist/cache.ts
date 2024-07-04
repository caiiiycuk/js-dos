/* eslint @typescript-eslint/no-unused-vars: 0 */

export interface Cache {
    put: (key: string, data: string | ArrayBuffer) => Promise<void>;
    get: (key: string, defaultValue?: string | ArrayBuffer) => Promise<string | ArrayBuffer>;
    forEach: (each: (key: string, value: any) => void, onend: () => void) => void;
    close: () => void;
}

class CacheNoop implements Cache {
    // eslint-disable-next-line
    public close() {
    }

    public put(key: string, data: string | ArrayBuffer): Promise<void> {
        return Promise.resolve();
    }

    public get(key: string, defaultValue?: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        if (defaultValue !== undefined) {
            return Promise.resolve(defaultValue);
        }
        return Promise.reject(new Error("Cache is not supported on this host"));
    }

    public forEach(each: (key: string, value: any) => void, onend: () => void) {
        onend();
    }
}

export function makeCache(version: string, logger: { onErr(...args: any[]): any }): Promise<Cache> {
    return new Promise((resolve) => {
        new CacheDbImpl(version, resolve, (msg: string) => {
            logger.onErr(msg);
            resolve(new CacheNoop());
        });
    });
}

class CacheDbImpl implements Cache {
    public version: string;
    private storeName = "files";
    private indexedDB: IDBFactory;
    private db: IDBDatabase | null = null;

    constructor(version: string, onready: (cache: Cache) => void, onerror: (msg: string) => void) {
        this.version = version;
        this.indexedDB = (typeof window === "undefined" ? undefined : window.indexedDB ||
                (window as any).mozIndexedDB ||
                (window as any).webkitIndexedDB || (window as any).msIndexedDB) as any;

        if (!this.indexedDB) {
            onerror("Indexed db is not supported on this host");
            return;
        }

        try {
            const openRequest = this.indexedDB.open("js-dos-cache (" + version + ")", 1);
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

                    this.db.createObjectStore(this.storeName);
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

    public put(key: string, data: string | ArrayBuffer): Promise<void> {
        return new Promise((resolve) => {
            if (this.db === null) {
                resolve();
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readwrite");
            transaction.oncomplete = () => resolve();
            transaction.objectStore(this.storeName).put(data, key);
        });
    }

    public get(key: string, defaultValue?: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        return new Promise((resolve, reject) => {
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
            const request = transaction.objectStore(this.storeName).get(key);
            request.onerror = () => reject(new Error("Can't read value for key '" + key + "'"));
            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result);
                } else {
                    rejectOrResolve("Result is empty for key '" + key + "', result: " + request.result);
                }
            };
        });
    }

    public forEach(each: (key: string, value: any) => void, onend: () => void) {
        if (this.db === null) {
            onend();
            return;
        }

        const transaction = this.db.transaction(this.storeName, "readonly");
        const request = transaction.objectStore(this.storeName).openCursor();
        request.onerror = () => onend();
        request.onsuccess = (event) => {
            const cursor = (event.target as any).result as IDBCursorWithValue;
            if (cursor) {
                each(cursor.key.toString(), cursor.value);
                cursor.continue();
            } else {
                onend();
            }
        };
    }
}
