import CacheDb from "./jsdos-cache-db";
import CacheNoop from "./jsdos-cache-noop";
import { DosConfig } from "./jsdos-options";

export interface ICache {
    put: (key: string, data: any, onflush: () => void) => void;
    get: (key: string, ondata: (data: any) => void, onerror: (msg: string) => void) => void;
    forEach: (each: (key: string, value: any) => void, onend: () => void) => void;
}

export default function openCache(version: string, config: DosConfig, onready: (cache: ICache) => void) {
    new CacheDb(version, onready, (msg: string) => {
        config.onerror("Can't initalize cache, cause: " + msg);
        onready(new CacheNoop());
    });
}
