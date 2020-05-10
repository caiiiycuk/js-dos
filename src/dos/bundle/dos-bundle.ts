// # DosBundle
// Is a complete bundle that contains everything needed to start dosbox server

import { DosConfig, createDosConfig, toDosboxConf } from "./dos-conf";
import LibZip from "../../libzip/libzip";

import { HTTPRequest } from "../../http";
import { Cache } from "../../cache";
import { WasmModule } from "../../modules";

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

export default class DosBundle {
    public config: DosConfig;
    public sources: DosArchiveSource[];

    private libzipWasm: WasmModule;
    private cache: Cache;

    constructor(libzipWasm: WasmModule, cache: Cache) {
        this.config = createDosConfig();
        this.sources = [];
        this.libzipWasm = libzipWasm;
        this.cache = cache;
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

    async toUint8Array(): Promise<Uint8Array> {
        const libzip = new LibZip(await this.libzipWasm.instantiate(), "/home/web_user");
        const conf = await toDosboxConf(this.config);

        const promises = [];
        for (const source of this.sources) {
            if (source.type !== "zip") {
                throw new Error("Only Zip is supported");
            }

            const resource = HTTPRequest(source.url, {
                cache: this.cache,
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

        const bundle = await libzip.zipFromFs();
        libzip.destroy();

        return bundle;
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
