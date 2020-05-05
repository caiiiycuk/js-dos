/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { testLoader } from "./test-loader";
import { testLibZip } from "./test-libzip";
import { testConf } from "./test-conf";
import { testBundle } from "./test-bundle";

// // import { testMiddleware } from "./test-middleware";
// import { testCI } from "./test-ci";

// // import { DosSokol, DosSokolWorker } from "../../server/jsdos-sokol/src/jsdos-sokol";

// // const middles = [ DosSokol, DosSokolWorker ];

// import DirectServer from "../../server/jsdos-direct/ts/direct";
// import WorkerServer from "../../server/jsdos-worker/ts/worker";

// import loadWasmModule from "../../client/jsdos/src/jsdos-wasm";
// import CacheNoop from "../../client/jsdos-cache/jsdos-cache-noop";


testLoader();
testLibZip();
testConf();
testBundle();

// const directWasmPromise = loadWasmModule("/wdirect.js", "WDIRECT", new CacheNoop(), () => {});

// directWasmPromise.then((directWasm) => {
//     testCI((bundle) => {
//         return DirectServer(directWasm, bundle, logger);
//     }, "DirectServer")
// });

// testCI((bundle) => {
//     return WorkerServer("/wworker.js", bundle, logger);
// }, "WorkerServer");


// // for (const middleware of middles) {
// //     testMiddleware(middleware);
// // }
