





  

```
import { ICache } from "./js-dos-cache";

export default class CacheDb implements ICache {

    public version: string;
    private storeName: string = "files";
    private indexedDB: IDBFactory;
    private db: IDBDatabase | null = null;

    constructor(version: string, onready: (cache: ICache) => void, onerror: (msg: string) => void) {
        this.version = version;
        this.indexedDB = window.indexedDB || (window as any).mozIndexedDB
            || (window as any).webkitIndexedDB || (window as any).msIndexedDB;

        if (!this.indexedDB) {
            onerror("Indexed db is not supported on this host");
            return;
        }

        const openRequest = this.indexedDB.open("js-dos-cache (" + version + ")", 1);
        openRequest.onerror = (event) => {
            onerror("Can't open cache database");
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
    }

    public put(key: string, data: any, onflush: () => void) {
        if (this.db === null) {
            onflush();
            return;
        }

        const transaction = this.db.transaction(this.storeName, "readwrite");
        transaction.oncomplete = () => onflush();
        transaction.objectStore(this.storeName).put(data, key);
    }

    public get(key: string, ondata: (data: any) => void, onerror: (msg: string) => void) {
        if (this.db === null) {
            onerror("db is not initalized");
            return;
        }

        const transaction = this.db.transaction(this.storeName, "readonly");
        const request = transaction.objectStore(this.storeName).get(key);
        request.onerror = () => onerror("Can't read value for key '" + key + "'");
        request.onsuccess = () => {
            if (request.result) {
                ondata(request.result);
            } else {
                onerror("Result is empty for key '" + key + "', result: " + request.result);
            }
        };
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


```




