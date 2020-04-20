/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { testLoader } from "./test-loader";
import { testLibZip } from "./test-libzip";
import { testBundle } from "./test-bundle";
import { testConf } from "./test-conf";
import { testMiddleware } from "./test-middleware";

import { DosSokol, DosSokolWorker } from "../../client/jsdos-sokol/src/jsdos-sokol";

const middles = [ DosSokol, DosSokolWorker ];

testLoader();
testLibZip();
testConf();
testBundle();

for (const middleware of middles) {
    testMiddleware(middleware);
}
