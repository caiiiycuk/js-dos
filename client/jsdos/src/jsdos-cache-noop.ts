import { Cache } from "../../interface/jsdos-interface";

export default class CacheNoop implements Cache {
    public put(key: string, data: any, onflush: () => void) {
        // nothing
    }

    public get(key: string, ondata: (data: any) => void, onerror: (msg: string) => void) {
        onerror("Cache is not supported on this host");
    }

    public forEach(each: (key: string, value: any) => void, onend: () => void) {
        onend();
    }
}
