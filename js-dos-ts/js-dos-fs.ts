// # DosFS
// API for working with file system of dosbox

import CacheNoop from "./js-dos-cache-noop";
import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

// ### DosArchiveSource
export interface DosArchiveSource {
    // source (archive) to download and extract via `extractAll`

    // **url** where archive is located
    url: string;

    // **mountPoint**
    mountPoint: string;
    // is a path to mount archive contents. There are two types of mountPoints:
    //
    // * path '/' which is a MEMFS that is live only in one ssesion.
    // It means that after restart all progress will be erased.
    //
    // * any other path (e.g. '/game'). This path will be stored across sessions in indexed db. It means
    // that progress will be there after browser restart.
    //
    // In other words, you can use path '/' to store temporal data, but others use to store
    // content that need to be persisten.
    //
    // **NOTE**: because content of folder is stored in indexed db original archive is downloaded
    // and extracted only once to avoid rewriting stored content! And you can't store different
    // content (from different archives) into one path.

    // **type** currently we support only zip archives
    type?: "zip";
}

// ## DosFS
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
    public extract(url: string, mountPoint: string = "/", type: "zip" = "zip"): Promise<void> {
        // simplified version of extractAll, works only for one archive. It calls extractAll inside.
        return this.extractAll([{ url, mountPoint, type }]);
    }

    // ### extractAll
    public extractAll(sources: DosArchiveSource[]): Promise<void> {
        // download given [`sources`](https://js-dos.com/6.22/docs/api/generate.html?page=js-dos-fs#dosfs-dosarchivesource)
        // and extract them to mountPoint's.
        //
        // this method will return `Promise<void>`, that will be resolved
        // on success with empty object or rejected
        const extractArchiveInCwd = (url: string, path: string, type: "zip") => {
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
                        this.chdir(path);

                        const bytes = new Uint8Array(data);
                        const buffer = this.em._malloc(bytes.length);
                        this.em.HEAPU8.set(bytes, buffer);
                        const retcode = this.em._extract_zip(buffer, bytes.length);
                        this.em._free(buffer);

                        if (retcode === 0) {
                            this.writeOk(path);
                            resolve();
                        } else {
                            reject("Can't extract zip, retcode " + retcode + ", see more info in logs");
                        }
                    },
                });
            });
        };

        const prepareMountFunction = (source: DosArchiveSource) => {
            const mountPoint = this.normalizePath(source.mountPoint);
            const type = source.type || "zip";
            const isRoot = mountPoint === "/" || mountPoint.length === 0;

            const parts = mountPoint.split("/");
            this.createPath(parts, 0, parts.length);

            const mountFn = () => {
                if (isRoot || !this.readOk(mountPoint)) {
                    if (!isRoot) {
                        this.dos.warn("Indexed db does not contains '" + mountPoint + "' rewriting...");
                    }
                    return extractArchiveInCwd(source.url, mountPoint, type);
                }
                return Promise.resolve();
            };

            if (!isRoot) {
                this.fs.mount(this.fs.filesystems.IDBFS, {}, mountPoint);
            }

            return mountFn;
        };

        return new Promise<void>((resolve, reject) => {
            if (this.lastSyncTime > 0) {
                reject("Can't create persistent mount point, after syncing process starts");
                return;
            }

            const mountFunctions: Array<() => Promise<void>> = [];
            for (const source of sources) {
                mountFunctions.push(prepareMountFunction(source));
            }

            this.fs.syncfs(true, (err: any) => {
                if (err) {
                    this.dos.error("Can't restore FS from indexed db, cause: " + err);
                }

                const promises: Array<Promise<void>> = [];
                for (const mountFn of mountFunctions) {
                    promises.push(mountFn());
                }

                Promise.all(promises)
                    .then(() => {
                        this.syncFs().then(resolve).catch(reject);
                    })
                    .catch(reject);
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
        file = file.replace(new RegExp("^[a-zA-z]+:"), "").replace(new RegExp("\\\\", "g"), "/");
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
