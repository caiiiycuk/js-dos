// # DosBundle
// Is a complete bundle that contains everything needed to start dosbox server

import { DosConfig, createDosConfig, toDosboxConf } from "./jsdos-conf";
import LibZip from "../../libzip/ts/src/jsdos-libzip";

export class DosBundle {
    public config: DosConfig;

    constructor() {
        this.config = createDosConfig();
    }

    async autoexec(...lines: string[]): Promise<DosBundle> {
        this.config.autoexec.options.script.value = lines.join("\n");
        return this;
    }

    async toUrl(libzip: LibZip): Promise<string> {
        const conf = await toDosboxConf(this.config);
        await libzip.writeFile(".jsdos/dosbox.conf", conf);
        await libzip.writeFile(".jsdos/readme.txt", readmeTxt);
        const bundle = await libzip.zipFromFs();
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
