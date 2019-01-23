



# DosFS
API for working with file system of dosbox


  

```

import { DosModule } from "./js-dos-module";
import { Xhr } from "./js-dos-xhr";

export class DosFS {
    private dos: DosModule;
    private em: typeof Module;

    constructor(dos: DosModule) {
        this.dos = dos;
        this.em = dos as any;
    }


```







## extract
download archive by given url and then extract it in cwd (cwd will be mounted as C:)
* `url` - url for downloading archive
* `type` - archive type **only zip is supported**


  

```
    public extract(url: string, type: string = "zip") {

```







this method will return `Promise<void>`, that will be resolved
on success with empty object or rejected


  

```
        return new Promise<void>((resolve, reject) => {
            if (type !== "zip") {
                reject("Only ZIP archive is supported");
                return;
            }

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
            });
        });
    }
}


```




