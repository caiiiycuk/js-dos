import { assert } from "chai";
import { compareAndExit } from "./compare"

import { DosBundle } from "../../client/jsdos-bundle/jsdos-bundle";
import { DosMiddleware } from "../../client/interface/jsdos-interface";

import Dos from "../../client/jsdos/src/jsdos";
import { DosKeys } from "../../client/jsdos/src/jsdos-keys";


export function testMiddleware(middleware: DosMiddleware) {
    testCommon(middleware);
    testConf(middleware);
    testPersistency(middleware);
    testDigger(middleware);
}

function testCommon(middleware: DosMiddleware) {
    suite("Common tests [" + middleware.constructor.name + "]");

    test("js-dos can't start without canvas", async () => {
        try {
            await Dos(null, middleware);
            assert.fail();
        } catch (e) {
            assert.equal("Element #dosbox not found in DOM", e.message);
        }
    });

    test("js-dos should start with canvas", async () => {
        const ci = await Dos("jsdos", middleware, { pathPrefix: "/" });
        assert.ok(ci);
        await ci.exit();
    });

    test("js-dos can take screenshot of canvas", async () => {
        const ci = await Dos("jsdos", middleware, { pathPrefix: "/" });
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });
}

function testConf(middleware: DosMiddleware) {suite("Conf tests [" + middleware.constructor.name + "]");

    test("should provide dosbox.conf for dosbox", async () => {
        const ci = await Dos("jsdos", middleware, { pathPrefix: "/" });
        assert.ok(ci);
        await compareAndExit("jsdos-conf.png", ci, 0);
    });

    test("should modify dosbox.conf through api", async () => {
        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: new DosBundle().autoexec("type jsdos~1/dosbox~1.con"),
        });
        assert.ok(ci);
        await compareAndExit("dosboxconf.png", ci, 0);
    });

    test("middleware should not start without jsdos conf", async () => {
        try {
            const ci = await Dos("jsdos", middleware, {
                pathPrefix: "/",
                bundle: "digger.zip",
            });
            assert.fail();
        } catch (e) {
            assert.equal("Broken bundle, .jsdos/dosbox.conf not found\n", e.message);
        }
    });
}

function testPersistency(middleware: DosMiddleware) {
    suite("Persistency tests [" + middleware.constructor.name + "]");

    test("should store fs updates between sessions [empty db]", async () => {
        await new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase("js-dos-cache (test-jsdos)");
            request.onerror = (err: any) => {
                console.log("err", err);
                reject(err);
            }
            request.onsuccess = resolve;
        });

        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: "digger.jsdos",
            persistencyKey: "test-jsdos",
        });
        assert.ok(ci);

        // await ci.persist(); - called autmatically on exit
        await compareAndExit("persistent-mount.png", ci);
    });

    test("should store fs updates between sessions [existent db]", async () => {
        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: "digger.jsdos",
            persistencyKey: "test-jsdos",
        });
        assert.ok(ci);

        await compareAndExit("persistent-mount-second.png", ci);
    });

    test("should ignore cache when persitency key not set", async () => {
        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: "digger.jsdos",
        });
        assert.ok(ci);

        await compareAndExit("persistent-mount.png", ci);
    });
}

function testDigger(middleware: DosMiddleware) {
    suite("Digger tests [" + middleware.constructor.name + "]");

    test("can run digger.jsdos", async () => {
        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: new DosBundle()
                .extract("digger.zip")
                .autoexec("DIGGER.COM"),
        });
        assert.ok(ci);

        await compareAndExit("digger.png", ci);
    });

    test("can simulate key events", async () => {
        const ci = await Dos("jsdos", middleware, {
            pathPrefix: "/",
            bundle: new DosBundle()
                .extract("digger.zip")
                .autoexec("DIGGER.COM"),
        });
        assert.ok(ci);

        await new Promise((resolve, reject) => {
            const keyPress = () => {
                ci.simulateKeyPress(DosKeys.KBD_left);
            };

            const screenshot = () => {
                compareAndExit("digger-end.png", ci)
                    .then(resolve)
                    .catch(reject);
            };

            setTimeout(keyPress, 2000);
            setTimeout(screenshot, 3000);
        });
    });


}
