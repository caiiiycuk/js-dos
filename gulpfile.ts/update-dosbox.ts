import { argv, exit } from "process";
import { log, warn, fatal } from "./log";
import fg from "fast-glob";
import { readFileSync, existsSync, mkdirpSync, writeFileSync } from "fs-extra";
import { join, dirname } from "path";

export async function updateDosbox() {
    const svnFlag = argv[3];
    const dosboxPath = argv[4];

    if (svnFlag !== "--svn" || dosboxPath === undefined) {
        fatal("Usage: gulp updateDosbox --svn <path-to-dosbox>");
    }

    const files = await fg([dosboxPath + "/**/*.cpp", dosboxPath + "/**/*.h", dosboxPath + "/**/*.c"]);

    for (const next of files) {
        const svnContent = readFileSync(next, "utf8").toString().split("\n");
        const svnEndIndex = getEndCopyrightIndex(svnContent);
        if (svnEndIndex === -1) {
            warn("Copyright not found in " + next);
            continue;
        }

        const targetFile = "native/dos/dosbox/" + next.substr(dosboxPath.length + 1);

        if (!existsSync(targetFile)) {
            warn("Target file " + targetFile + " not exists");
            continue;
        }

        const content = readFileSync(targetFile, "utf8").toString().split("\n");
        const endIndex = getEndCopyrightIndex(content);
        if (endIndex === -1) {
            warn("Header not found in " + targetFile);
            continue;
        }

        const header = svnContent.slice(0, svnEndIndex + 1).join("\n");
        const withoutHeader = content.slice(endIndex + 1);
        const updated = header + "\n" + withoutHeader.join("\n");

        writeFileSync(targetFile, updated, "utf8");
    }
}

function getEndCopyrightIndex(content: string[]) {
    const openRegex = /\*\s+Copyright/i;

    let copyrightOpened = false;
    let index = 0;

    while (index < content.length) {
        if (copyrightOpened) {
            if (content[index].indexOf("*/") >= 0) {
                return index;
            }
        } else {
            copyrightOpened = openRegex.test(content[index]);
        }
        ++index;
    }

    return -1;
}
