// # DosFS
// API for working with file system of dosbox

import CacheNoop from "./js-dos-cache-noop";
import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

export class DosFS {
    private dos: DosModule;
    private em: any; // typeof Module;
    private fs: any;
    private syncingPromise: Promise<void> | null = null;
    private lastSyncTime = 0;

    constructor(dos: DosModule) {
        this.dos = dos;
        this.em = dos as any;
        this.fs = (dos as any).FS;

        // Sync fs to indexed db periodically
        this.dos.registerTickListener(() => {
            if (Date.now() - this.lastSyncTime < 5000) {
                return;
            }
            this.lastSyncTime = Date.now();
            this.syncFs();
        });
        this.dos.registerPauseListener(() => this.syncFs());
        this.dos.registerTerminateListener(() => this.syncFs());
    }

    public chdir(path: string) {
        this.fs.chdir(path);
    }

    // ### extract
    public extract(url: string, persistentMount: string = "/", type: string = "zip") {
        // download archive by given url and then extract it in cwd (cwd will be mounted as C:)
        //
        // * `url` - url for downloading archive
        // * `persistentMount` - is a path to mount archive contents, by default mount point is '/' which
        // is a MEMFS that is live only in one ssesion. It means that after restart all progress will be erased.
        // If you set some path (any), then this path will be stored across sessions in indexed db. It means
        // that progress will be there after browser restart.
        // * `type` - archive type **only zip is supported**
        //
        // this method will return `Promise<void>`, that will be resolved
        // on success with empty object or rejected

        persistentMount = this.normalizePath(persistentMount);

        const parts = persistentMount.split("/");
        this.createPath(parts, 0, parts.length);
        this.chdir(persistentMount);

        const extractArchiveInCwd = () => {
            return new Promise<void>((resolve, reject) => {
                if (type !== "zip") {
                    reject("Only ZIP archive is supported");
                    return;
                }

                new Xhr(url, {
                    cache: new CacheNoop(),
                    responseType: "arraybuffer",
                    fail: (msg) => reject(msg),
                    progress: (total, loaded) => {
                        if (this.dos.onprogress !== undefined) {
                            this.dos.onprogress("Downloading " + url, total, loaded);
                        }
                    },
                    success: (data: ArrayBuffer) => {
                        const bytes = new Uint8Array(data);
                        const buffer = this.em._malloc(bytes.length);
                        this.em.HEAPU8.set(bytes, buffer);
                        const retcode = this.em._extract_zip(buffer, bytes.length);
                        this.em._free(buffer);

                        if (retcode === 0) {
                            this.writeOk(persistentMount);
                            this.syncFs().then(resolve).catch(reject);
                        } else {
                            reject("Can't extract zip, retcode " + retcode + ", see more info in logs");
                        }
                    },
                });
            });
        };

        if (persistentMount === "/" || persistentMount.length === 0) {
            return extractArchiveInCwd();
        }

        return new Promise<void>((resolve, reject) => {
            if (this.lastSyncTime > 0) {
                reject("Can't create persistent mount point, after syncing process starts");
                return;
            }

            this.fs.mount(this.fs.filesystems.IDBFS, {}, persistentMount);
            this.fs.syncfs(true, (err: any) => {
                if (err) {
                    reject("Can't restore FS from indexed db, cause: " + err);
                    return;
                }

                if (!this.readOk(persistentMount)) {
                    this.dos.warn("Indexed db contains broken FS, resetting...");
                    extractArchiveInCwd().then(resolve).catch(reject);
                    return;
                }

                resolve();
            });
        });
    }

    // ### createFile
    public createFile(file: string, body: ArrayBuffer | Uint8Array | string) {
        // [synchronous] allow to create file in FS, you can pass absolute path.
        // All directories will be created
        //
        // body can be string or ArrayBuffer or Uint8Array

        if (body instanceof ArrayBuffer) {
            body = new Uint8Array(body);
        }

        // windows style path are also valid, but **drive letter is ignored**
        // if you pass only filename, then file will be writed in root "/" directory
        file = file.replace(new RegExp("^[a-zA-z]+:"), "") .replace(new RegExp("\\\\", "g"), "/");
        const parts = file.split("/");

        if (parts.length === 0) {
            if (this.dos.onerror !== undefined) {
                this.dos.onerror("Can't create file '" + file + "', because it's not valid file path");
            }
            return;
        }

        const filename = parts[parts.length - 1].trim();

        if (filename.length === 0) {
            if (this.dos.onerror !== undefined) {
                this.dos.onerror("Can't create file '" + file + "', because file name is empty");
            }
            return;
        }

        /* i < parts.length - 1, because last part is file name */
        const path = this.createPath(parts, 0, parts.length - 1);
        this.fs.createDataFile(path, filename, body, true, true, true);
    }

    private createPath(parts: string[], begin: number, end: number) {
        let path = "";
        for (let i = begin; i < end; ++i) {
            const part = parts[i].trim();
            if (part.length === 0) {
                continue;
            }

            this.fs.createPath(path, part, true, true);
            path = path + "/" + part;
        }

        return path;
    }

    private syncFs() {
        if (this.syncingPromise) {
            return this.syncingPromise;
        }

        this.syncingPromise = new Promise<void>((resolve, reject) => {
            const startedAt = Date.now();
            this.fs.syncfs(false, (err: any) => {
                if (err) {
                    this.dos.error("Can't sync FS to indexed db, cause: " + err);
                    reject(err);
                }
                this.syncingPromise = null;
                this.lastSyncTime = Date.now();
                resolve();
            });
        });

        return this.syncingPromise;
    }

    private normalizePath(path: string) {
        if (path.length === 0 || path[0] !== "/") {
            path = "/" + path;
        }

        if (path.length > 1 && path.endsWith("/")) {
            path = path.substr(0, path.length - 1);
        }

        return path;
    }

    private readOk(path: string) {
        try {
            const readed = this.fs.readFile(path + "/state.fs");
            return readed[0] === 79 && readed[1] === 70;
        } catch {
            return false;
        }
    }

    private writeOk(path: string) {
        this.createFile(path + "/state.fs", new Uint8Array([79, 70])); // Ok
    }

}
