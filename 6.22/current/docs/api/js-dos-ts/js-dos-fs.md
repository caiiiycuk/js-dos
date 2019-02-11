



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







### extract


  

```
    public extract(url: string, type: string = "zip") {

```







download archive by given url and then extract it in cwd (cwd will be mounted as C:)

* `url` - url for downloading archive
* `type` - archive type **only zip is supported**

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


```







### createFile - this method is synchronous


  

```
    public createFile(file: string, body: ArrayBuffer | Uint8Array | string) {

```







allow to create file in FS, you can pass absolute path
all directories will be created

body can be string or ArrayBuffer or Uint8Array


  

```

        if (body instanceof ArrayBuffer) {
            body = new Uint8Array(body);
        }


```







windows style path are also handler, but **drive letter is ignored**
if you pass only filename, then file will be writed in root "/" directory


  

```
        file = file.replace(new RegExp("^[a-zA-z]+:"), "") .replace(new RegExp("\\\\", "g"), "/");
        const parts = file.split("/");

        if (parts.length === 0) {
            this.dos.onerror("Can't create file '" + file + "', because it's not valid file path");
            return;
        }

        const filename = parts[parts.length - 1].trim();

        if (filename.length === 0) {
            this.dos.onerror("Can't create file '" + file + "', because file name is empty");
            return;
        }

        /* i < parts.length - 1, because last part is file name */
        let path = "/";
        for (let i = 0; i < parts.length - 1; ++i) {
            const part = parts[i].trim();
            if (part.length === 0) {
                continue;
            }

            (this.em as any).FS_createPath(path, part, true, true);
            path = path + "/" + part;
        }

        (this.em as any).FS_createDataFile(path, filename, body, true, true, true);
    }
}


```




