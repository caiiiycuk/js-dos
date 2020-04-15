/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { testLibZip } from "./test-libzip";
import { testLoader } from "./test-loader";
import { testMiddleware } from "./test-middleware";

import DosSokol, { DosSokolWorker } from "../../client/jsdos-sokol/src/jsdos-sokol";

const middles = [ DosSokol, DosSokolWorker ];

testLoader();
testLibZip();

for (const middleware of middles) {
    testMiddleware(middleware);
}
