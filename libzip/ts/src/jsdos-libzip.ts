export default class LibZip {
    public module: any;

    constructor(module: any) {
        this.module = module;
    }

    zipFromFs(): Promise<Uint8Array> {
        const ptr = this.module._zip_from_fs();
        if (ptr === 0) {
            return Promise.reject(new Error("Can't create zip, see more info in logs"));
        }

        const length = this.module.HEAPU32[ptr / 4];
        const memory: Uint8Array = this.module.HEAPU8;
        const archive = memory.slice(ptr + 4, ptr + 4 + length);
        this.module._free(ptr);
        return Promise.resolve(archive);
    }

    zipToFs(zipArchive: Uint8Array): Promise<void> {
        const bytes = new Uint8Array(zipArchive);
        const buffer = this.module._malloc(bytes.length);
        this.module.HEAPU8.set(bytes, buffer);
        const retcode = this.module._zip_to_fs(buffer, bytes.length);
        this.module._free(buffer);

        if (retcode === 0) {
            return Promise.resolve();
        } else {
            return Promise.reject(new Error("Can't extract zip, retcode " +
                retcode + ", see more info in logs"));
        }
    }

    destroy(): any {
        try {
            this.module._libzip_destroy();
        } catch (e) {
            return e;
        }
    }

}
