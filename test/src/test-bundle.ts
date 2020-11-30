import { assert } from "chai";

import { createDosConfig, toDosboxConf } from "../../src/dos/bundle/dos-conf";
import DosBundle from "../../src/dos/bundle/dos-bundle";

import { makeLibZip, destroy } from "./libzip";
import LibZip from "../../src/libzip/libzip";

import emulators from "../../src/impl/emulators-impl";

async function toFs(bundle: DosBundle,
                    cb: (libzip: LibZip) => Promise<void>,
                    overwriteConfig: boolean = false) {
    const packer = await makeLibZip();
    const array = await bundle.toUint8Array(overwriteConfig);
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
        await toFs(await emulators.dosBundle(), async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            assert.ok(conf);
            const expected = await toDosboxConf(createDosConfig());
            assert.equal(expected, conf);
        });
    });

    test("bundle should download and extract archive to root", async () => {
        const dosBundle = (await emulators.dosBundle())
            .extract("digger.zip", "/");

        await toFs(dosBundle, async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            const digger = await fs.readFile("/DIGGER.COM", "binary");
            assert.ok(conf);
            assert.ok(digger);
        });
    });

    test("bundle conf can be overwritten", async () => {
        const dosBundle = await (await emulators.dosBundle());
        const testPhrase = "overwritten by test";
        dosBundle.config.autoexec.options.script.value = testPhrase; 
        dosBundle.extract("digger.jsdos", "/");

        await toFs(dosBundle, async (fs) => {
            const conf = (await fs.readFile(".jsdos/dosbox.conf", "utf8")) as string;
            assert.ok(conf.indexOf(testPhrase) === -1, "dosbox.conf should not contains test phrase");
        });

        await toFs(dosBundle, async (fs) => {
            const conf = (await fs.readFile(".jsdos/dosbox.conf", "utf8")) as string;
            assert.ok(conf.indexOf(testPhrase) > 0, "dosbox.conf should contains test phrase");
        }, true);
    });


    test("bundle should download and extract archive to path", async () => {
        const dosBundle = (await emulators.dosBundle())
            .extract("digger.zip", "test");

        await toFs(dosBundle, async (fs) => {
            const conf = await fs.readFile(".jsdos/dosbox.conf");
            const digger = await fs.readFile("/test/DIGGER.COM", "binary");
            assert.ok(conf);
            assert.ok(digger)
        });
    });

    test("bundle should extract multiple archive to paths", async () => {
        const dosBundle = (await emulators.dosBundle())
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
