/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import testCommon from "./common";
import DosSokol, { DosSokolWorker } from "../../client/jsdos-sokol/src/jsdos-sokol";

const middles = [ DosSokol, DosSokolWorker ];

for (const middleware of middles) {
    suite("Common tests [" + middleware.constructor.name + "]");
    testCommon(middleware);
}
