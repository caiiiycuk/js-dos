import { assert } from "chai";
import { compareAndExit } from "./compare"

import DosBundle from "../../src/dos/bundle/dos-bundle";
import Emulators, { CommandInterface } from "../../src/emulators";

import { HTTPRequest } from "../../src/http";
import { CacheNoop } from "../../src/cache";

import { Keys } from "../../src/keys";

type CIFactory = (bundle: Uint8Array) => Promise<CommandInterface>;

export function testDos() {
    testServer((bundle) => Emulators.dosDirect(bundle), "dosDirect");
    testServer((bundle) => Emulators.dosWorker(bundle), "dosWorker");
}

function testServer(factory: CIFactory, name: string) {
    suite(name + ".common");

    async function CI(bundle: DosBundle | Promise<DosBundle>) {
        bundle = await Promise.resolve(bundle);
        return await factory(await bundle.toUint8Array());
    }

    test(name + " can take screenshot of dosbox", async () => {
        const ci = await CI(Emulators.dosBundle());
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });

    test(name + " should provide dosbox.conf for dosbox", async () => {
        const ci = await CI(Emulators.dosBundle());
        assert.ok(ci);
        await compareAndExit("jsdos-conf.png", ci, 0);
    });

    test(name + " should modify dosbox.conf through api", async () => {
        const ci = await CI((await Emulators.dosBundle())
            .autoexec("type jsdos~1/dosbox~1.con"));
        assert.ok(ci);
        await compareAndExit("dosboxconf.png", ci, 0);
    });

    test(name + " should not start without jsdos conf", async () => {
        try {
            const buffer = await HTTPRequest("digger.zip", {
                cache: new CacheNoop(),
                responseType: "arraybuffer",
            });
            const ci = await factory(new Uint8Array(buffer as ArrayBuffer));
            assert.fail();
        } catch (e) {
            assert.equal("Broken bundle, .jsdos/dosbox.conf not found\n", e.message);
        }
    });

    suite(name + ".persistency");

    let cachedBundle: Uint8Array = new Uint8Array();
    test(name + " should store fs updates between sessions [empty db]", async () => {
        const buffer = await HTTPRequest("digger.jsdos", {
            cache: new CacheNoop(),
            responseType: "arraybuffer",
        });

        const ci = await factory(new Uint8Array(buffer as ArrayBuffer));
        assert.ok(ci);
        cachedBundle = await ci.persist();
        await compareAndExit("persistent-mount.png", ci);
    });

    test(name + " should store fs updates between sessions [existent db]", async () => {
        const ci = await factory(cachedBundle);
        assert.ok(ci);
        cachedBundle = new Uint8Array();
        await compareAndExit("persistent-mount-second.png", ci);
    });

    suite(name + ".digger");

    test(name + " can run digger.jsdos", async () => {
        const ci = await CI((await Emulators.dosBundle())
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);
        await compareAndExit("digger.png", ci);
    });

    test(name + " can play sound", async () => {
        const ci = await CI((await Emulators.dosBundle())
                                .extract("digger.zip")
                                .autoexec("DIGGER.COM"));
        assert.ok(ci);
        assert.ok(ci.soundFrequency() > 0, "sound frequency is zero");

        const samples = await new Promise<Float32Array>((resolve) => {
            ci.events().onSoundPush((samples: Float32Array) => {
                resolve(samples);
            });
        });

        console.log(ci.soundFrequency(), samples);
        assert.ok(samples.byteLength > 0, "samples is empty");
        await ci.exit();
    })

    test(name + " can simulate key events", async () => {
        const ci = await CI((await Emulators.dosBundle())
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);

        await new Promise((resolve, reject) => {
            const keyPress = () => {
                ci.simulateKeyPress(Keys.KBD_left);
            };

            const screenshot = () => {
                compareAndExit("digger-end.png", ci, 2)
                    .then(resolve)
                    .catch(reject);
            };

            setTimeout(keyPress, 2000);
            setTimeout(screenshot, 3000);
        });
    });

}
