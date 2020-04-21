// # DosBundle
// Is a complete bundle that contains everything needed to start dosbox server

import { DosConfig, createDosConfig, toDosboxConf } from "./jsdos-conf";
import LibZip from "../../libzip/ts/src/jsdos-libzip";
import { ResourceFactory, Cache } from "../interface/jsdos-interface";

// ### DosArchiveSource
export interface DosArchiveSource {
    // source (archive) to download and extract via `extractAll`

    // **url** where archive is located
    url: string;

    // **path**
    path: string;

    // **type**
    type?: "zip";
    // archive type, now only Zip is supported
}

export class DosBundle {
    public config: DosConfig;
    public sources: DosArchiveSource[];

    constructor() {
        this.config = createDosConfig();
        this.sources = [];
    }

    autoexec(...lines: string[]): DosBundle {
        this.config.autoexec.options.script.value = lines.join("\n");
        return this;
    }

    cycles(cycles: string): DosBundle {
        this.config.cpu.options.cycles.value = cycles;
        return this;
    }

    // ### extract
    extract(url: string, path: string = "/", type: "zip" = "zip"): DosBundle {
        // simplified version of extractAll, works only for one archive. It calls extractAll inside.
        return this.extractAll([{ url, path, type }]);
    }

    // ### extractAll
    public extractAll(sources: DosArchiveSource[]): DosBundle {
        // download given [`sources`](https://js-dos.com/6.22/docs/api/generate.html?page=jsdos-bundle#dosfs-dosarchivesource)
        // and extract them to mountPoint's.
        this.sources.push(...sources);
        return this;
    }

    async toUint8Array(libzip: LibZip,
                       cache: Cache,
                       createResouce: ResourceFactory): Promise<Uint8Array> {
        const conf = await toDosboxConf(this.config);

        const promises = [];
        for (const source of this.sources) {
            if (source.type !== "zip") {
                throw new Error("Only Zip is supported");
            }

            const resource = createResouce(source.url, {
                cache,
                responseType: "arraybuffer",
            }).then((buffer: string | ArrayBuffer) => {
                return {
                    source,
                    data: new Uint8Array(buffer as ArrayBuffer),
                }
            });

            promises.push(resource);
        }

        await libzip.writeFile(".jsdos/dosbox.conf", conf);
        await libzip.writeFile(".jsdos/readme.txt", readmeTxt);

        const resources = await Promise.all(promises);
        for (const resource of resources) {
            libzip.zipToFs(resource.data, resource.source.path);
        }

        return await libzip.zipFromFs();
    }

    async toUrl(libzip: LibZip,
                cache: Cache,
                createResource: ResourceFactory): Promise<string> {
        const bundle = await this.toUint8Array(libzip, cache, createResource);
        return URL.createObjectURL(new Blob([bundle], { type: "application/zip" }));
    }
}



const readmeTxt = `
Please visit our website:

        _                __                               
       (_)____      ____/ /___  _____ _________  ____ ___ 
      / / ___/_____/ __  / __ \\/ ___// ___/ __ \\/ __ \`__ \\
     / (__  )_____/ /_/ / /_/ (__  )/ /__/ /_/ / / / / / /
  __/ /____/      \\__,_/\\____/____(_)___/\\____/_/ /_/ /_/ 
 /___/                                                    
`;
