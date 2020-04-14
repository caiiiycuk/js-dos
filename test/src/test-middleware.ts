import { assert } from "chai";
import { compareAndExit } from "./compare"

import { DosMiddleware } from "../../client/shared/jsdos-shared";

import Dos from "../../client/jsdos/src/jsdos";


export function testMiddleware(middleware: DosMiddleware) {
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
        const ci = await Dos("jsdos",
                             middleware, {
                                 middlewareUrl: "/" + middleware.defaultUrl,
                             });
        assert.ok(ci);
        await ci.exit();
    });

    test("js-dos can take screenshot of canvas", async () => {
        const ci = await Dos("jsdos",
                             middleware, {
                                 middlewareUrl: "/" + middleware.defaultUrl,
                             });
        assert.ok(ci);
        await compareAndExit("init.png", ci);
    });
}

