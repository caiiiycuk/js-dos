import { Dos } from "./js-dos";
import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

// FS
// ==
// Api for working with inmemory file system that used by emulation layer

export class DosFS {
    private dos: DosModule;
    private em: typeof Module;

    constructor(dos: DosModule) {
        this.dos = dos;
        this.em = dos as any;
    }

    // **extract** - downloads url and extract it in cwd,
    // supported only zip archive
    public extract(url: string) {
        return new Promise<void>((resolve, reject) => {
            new Xhr(url, {
                responseType: "arraybuffer",
                fail: (msg) => reject(msg),
                progress: (total, loaded) => this.dos.onprogress("Downloading " + url, total, loaded),
                success: (data: ArrayBuffer) => {
                    const bytes = new Uint8Array(data);
                    const buffer = this.em._malloc(bytes.length);
                    this.em.HEAPU8.set(bytes, buffer);
                    const retcode = (this.em as any)._extract_zip(buffer, bytes.length);
                    this.em._free(buffer);

                    if (retcode === 0) {
                        resolve();
                    } else {
                        reject("Can't extract zip, retcode " + retcode + ", see more info in logs");
                    }
                },
            })
        });
    }
}
