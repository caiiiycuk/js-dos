import { assert } from "chai";
import { compareAndExit } from "./compare"

import { DosBundle } from "../../client/jsdos-bundle/jsdos-bundle";
import { DosCommandInterface } from "../../client/interface/jsdos-interface";

import Dos from "../../client/jsdos/src/jsdos";
import { DosKeys } from "../../client/jsdos/src/jsdos-keys";

import { makeLibZip, destroy } from "./libzip";
import CacheNoop from "../../client/jsdos-cache/jsdos-cache-noop";
import { XhrRequest } from "../../client/jsdos/src/jsdos-xhr";

export type CIFactory = (bundle: Uint8Array) => Promise<DosCommandInterface>;

export function testCI(factory: CIFactory, name: string) {
    suite(name + ".common");

    async function toBuffer(bundle: DosBundle) {
        const packer = await makeLibZip();
        const buffer = await bundle.toUint8Array(packer, new CacheNoop(), XhrRequest);
        destroy(packer);
        return buffer;
    }

    async function CI(bundle: DosBundle | Promise<DosBundle>) {
        bundle = await Promise.resolve(bundle);
        return await factory(await toBuffer(bundle));
    }

    test(name + " can take screenshot of dosbox", async () => {
        const ci = await CI(new DosBundle());
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });

    test(name + " should provide dosbox.conf for dosbox", async () => {
        const ci = await CI(new DosBundle());
        assert.ok(ci);
        await compareAndExit("jsdos-conf.png", ci, 0);
    });

    test(name + " should modify dosbox.conf through api", async () => {
        const ci = await CI(new DosBundle()
            .autoexec("type jsdos~1/dosbox~1.con"));
        assert.ok(ci);
        await compareAndExit("dosboxconf.png", ci, 0);
    });

    test(name + " should not start without jsdos conf", async () => {
        try {
            const buffer = await XhrRequest("digger.zip", {
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
        const buffer = await XhrRequest("digger.jsdos", {
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
        const ci = await CI(new DosBundle()
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);
        await compareAndExit("digger.png", ci);
    });

    test("can simulate key events", async () => {
        const ci = await CI(new DosBundle()
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);

        await new Promise((resolve, reject) => {
            const keyPress = () => {
                ci.simulateKeyPress(DosKeys.KBD_left);
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
