import { assert } from "chai";

import { createDosConfig, toDosboxConf, DosConfig } from "../../src/dos/bundle/dos-conf";
import DosBundle from "../../src/dos/bundle/dos-bundle";

import { makeLibZip, destroy } from "./libzip";
import LibZip from "../../native/libzip/ts/src/jsdos-libzip";
import { CacheNoop } from "../../src/cache";

import Emulators from "../../src/emulators";

async function toFs(bundle: DosBundle,
                    cb: (libzip: LibZip) => Promise<void>) {
    const packer = await makeLibZip();
    const array = await bundle.toUint8Array();
    destroy(packer);

    const unpacker = await makeLibZip();
    await unpacker.zipToFs(array);
    await cb(unpacker);
    destroy(unpacker);
}

// async function save(bundle: DosBundle) {
//     const packer = await makeLibZip();
//     const url = await bundle.toUrl(packer, new CacheNoop(), XhrRequest);
//     destroy(packer);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "archive.zip";
//     document.body.appendChild(a);
//     a.click();

//     setTimeout(() => {
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//     }, 0);
// }

export function testDosBundle() {
    suite("bundle");

    test("bundle should contain default dosbox.conf", async () => {
        await toFs(await Emulators.dosBundle(), async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            assert.ok(conf);
            const expected = await toDosboxConf(createDosConfig());
            assert.equal(expected, conf);
        });
    });

    test("bundle should download and extract archive to root", async () => {
        const dosBundle = (await Emulators.dosBundle())
            .extract("digger.zip", "/");

        await toFs(dosBundle, async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            const digger = await fs.readFile("/DIGGER.COM", "binary");
            assert.ok(conf);
            assert.ok(digger);
        });
    });

    test("bundle should download and extract archive to path", async () => {
        const dosBundle = (await Emulators.dosBundle())
            .extract("digger.zip", "test");

        await toFs(dosBundle, async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            const digger = await fs.readFile("/test/DIGGER.COM", "binary");
            assert.ok(conf);
            assert.ok(digger)
        });
    });

    test("bundle should extract multiple archive to paths", async () => {
        const dosBundle = (await Emulators.dosBundle())
            .extract("digger.zip", "/test")
            .extract("arkanoid.zip", "/arkanoid");

        await toFs(dosBundle, async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            const digger = await fs.readFile("/test/DIGGER.COM", "binary");
            const arkanoid = await fs.readFile("/arkanoid/Arkanoid/ARKANOID.COM", "binary");
            assert.ok(conf);
            assert.ok(digger);
            assert.ok(arkanoid);
        });
    });
}
