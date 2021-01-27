import { assert } from "chai";
import { compareAndExit } from "./compare"

import DosBundle from "../../src/dos/bundle/dos-bundle";
import { CommandInterface } from "../../src/emulators";
import emulatorsImpl from "../../src/impl/emulators-impl";

import { HTTPRequest } from "../../src/http";
import { CacheNoop } from "../../src/cache";

import { Keys } from "../../src/keys";
import { createDosConfig } from "../../src/dos/bundle/dos-conf";

type CIFactory = (bundle: Uint8Array) => Promise<CommandInterface>;

export function testDos() {
    testServer((bundle) => emulatorsImpl.dosDirect(bundle), "dosDirect");
    testServer((bundle) => emulatorsImpl.dosWorker(bundle), "dosWorker");
}

function testServer(factory: CIFactory, name: string) {
    suite(name + ".common");

    async function CI(bundle: DosBundle | Promise<DosBundle>) {
        bundle = await Promise.resolve(bundle);
        return await factory(await bundle.toUint8Array());
    }

    test(name + " can take screenshot of dosbox", async () => {
        const ci = await CI(emulatorsImpl.dosBundle());
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });

    test(name + " should provide dosbox.conf for dosbox", async () => {
        const ci = await CI(emulatorsImpl.dosBundle());
        assert.ok(ci);
        await compareAndExit("jsdos-conf.png", ci, 0);
    });

    test(name + " should modify dosbox.conf through api", async () => {
        const ci = await CI((await emulatorsImpl.dosBundle())
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
            assert.equal("[\"Broken bundle, .jsdos/dosbox.conf not found\"]\n", e.message);
        }
    });

    test(name + " should provide config back to js", async () => {
        const bundle = await emulatorsImpl.dosBundle();
        const ci = await CI(bundle);
        assert.ok(ci);
        const config = await ci.config();
        assert.equal(JSON.stringify(config), JSON.stringify(bundle.config));
        await ci.exit();
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
        const ci = await CI((await emulatorsImpl.dosBundle())
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);
        await compareAndExit("digger.png", ci);
    });

    test(name + " can play sound", async () => {
        const ci = await CI((await emulatorsImpl.dosBundle())
                                .extract("digger.zip")
                                .autoexec("DIGGER.COM"));
        assert.ok(ci);
        assert.equal(ci.soundFrequency(), 44100, "sound frequency should be 22050");

        const samples = await new Promise<Float32Array>((resolve) => {
            ci.events().onSoundPush((samples: Float32Array) => {
                resolve(samples);
            });
        });

        assert.ok(samples.byteLength > 0, "samples is empty");
        await ci.exit();
    })

    test(name + " exit event", async () => {
        const ci = await CI((await emulatorsImpl.dosBundle())
                                .extract("digger.zip")
                                .autoexec("DIGGER.COM"));
        assert.ok(ci);
        const exitPromise = new Promise<void>((resolve) => {
            ci.events().onExit(() => {
                resolve();
            });
        });
        await ci.exit();
        await exitPromise;
        assert.ok(true);
    })

    test(name + " can simulate key events", async () => {
        const ci = await CI((await emulatorsImpl.dosBundle())
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

    test(name + " can simulate key combination", async () => {
        const ci = await CI((await emulatorsImpl.dosBundle())
            .extract("digger.zip")
            .autoexec("DIGGER.COM"));
        assert.ok(ci);

        const addKeyEventCalled = [];
        let initialTime = 0;
        (ci as any).addKey = (keyCode, pressed, timeMs) => {
            if (initialTime === 0) {
                initialTime = timeMs;
            }
            addKeyEventCalled.push([keyCode, pressed, timeMs]);
        }

        await new Promise((resolve, reject) => {
            const keyPress = () => {
                ci.simulateKeyPress(Keys.KBD_left, Keys.KBD_leftctrl, Keys.KBD_leftshift);
            };

            const assertKeyPressSequence = () => {
                assert.deepEqual(addKeyEventCalled, [
                    [Keys.KBD_left, true, initialTime],
                    [Keys.KBD_leftctrl, true, initialTime],
                    [Keys.KBD_leftshift, true, initialTime],
                    [Keys.KBD_left, false, initialTime + 16],
                    [Keys.KBD_leftctrl, false, initialTime + 16],
                    [Keys.KBD_leftshift, false, initialTime + 16],
                ]);
                resolve();
            };

            setTimeout(keyPress, 2000);
            setTimeout(assertKeyPressSequence, 2100);
        });

        await ci.exit();
    });

    test(name + " can simulate mouse events", async () => {
        const buffer = await HTTPRequest("mousetst.jsdos", {
            cache: new CacheNoop(),
            responseType: "arraybuffer",
        });

        const ci = await factory(new Uint8Array(buffer as ArrayBuffer));
        assert.ok(ci);

        await new Promise((resolve, reject) => {
            const sendFn = () => {
                ci.sendMouseMotion(380 / 640, 250 / 400);
                ci.sendMouseButton(0, true);
            }

            const screenshot = () => {
                compareAndExit("mousetst.png", ci, 2)
                    .then(resolve)
                    .catch(reject);
            };

            setTimeout(sendFn, 1000);
            setTimeout(screenshot, 2000);
        });
    });
}
