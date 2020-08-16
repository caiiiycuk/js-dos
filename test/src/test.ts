/* tslint:disable:max-line-length */
/* tslint:disable:no-console */

import { testLoader } from "./test-loader";
import { testLibZip } from "./test-libzip";
import { testConf } from "./test-conf";
import { testDosBundle } from "./test-bundle";
import { testDos } from "./test-dos";

import emulatorsImpl from "../../src/impl/emulators-impl";

emulatorsImpl.pathPrefix = "/";

testLoader();
testLibZip();
testConf();

testDosBundle();
testDos();
