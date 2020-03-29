/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { testLoader, testCommons } from "./common";
import DosSokol, { DosSokolWorker } from "../../client/jsdos-sokol/src/jsdos-sokol";

const middles = [ DosSokol, DosSokolWorker ];

suite("WASM loader");
testLoader();

for (const middleware of middles) {
    suite("Common tests [" + middleware.constructor.name + "]");
    testCommons(middleware);
}
