import { assert } from "chai";
import { compareAndExit } from "./compare"

import { DosBundle } from "../../client/jsdos-bundle/jsdos-bundle";
import { DosMiddleware } from "../../client/interface/jsdos-interface";

import Dos from "../../client/jsdos/src/jsdos";


export function testMiddleware(middleware: DosMiddleware) {
    testCommon(middleware);
    testConf(middleware);
    testStorage(middleware);
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

function testConf(middleware: DosMiddleware) {
    suite("Shell tests [" + middleware.constructor.name + "]");

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
}

function testStorage(middleware: DosMiddleware) {
    suite("Storage tests [" + middleware.constructor.name + "]");

    test("should provide dosbox.conf for dosbox", async () => {
    });
}
