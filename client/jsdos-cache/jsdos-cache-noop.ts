import { Cache } from "../interface/jsdos-interface";

export default class CacheNoop implements Cache {

    public close() {
    }

    public put(key: string, data: string | ArrayBuffer): Promise<void> {
        return Promise.resolve();
    }

    public get(key: string, defaultValue?: string | ArrayBuffer): Promise<string | ArrayBuffer> {
        if (defaultValue !== undefined) {
            return Promise.resolve(defaultValue);
        }
        return Promise.reject("Cache is not supported on this host");
    }

    public forEach(each: (key: string, value: any) => void, onend: () => void) {
        onend();
    }
}
