export default class LibZip {
    module: any;
    private home;
    constructor(module: any, home: string);
    zipFromFs(changedAfterMs?: number): Promise<Uint8Array>;
    zipToFs(zipArchive: Uint8Array, path?: string): Promise<void>;
    writeFile(file: string, body: ArrayBuffer | Uint8Array | string): void;
    readFile(file: string, encoding?: "binary" | "utf8"): Promise<string | Uint8Array>;
    exists(file: string): boolean;
    destroy(): any;
    private normalizeFilename;
    private createPath;
    private chdirToHome;
    private chdir;
}
