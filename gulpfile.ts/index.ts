import * as fs from "fs";

import { series } from "gulp";
import { libzip } from "./libzip";
import { sokol } from "./sokol";
import { test } from "./test";

exports.libzip = libzip;
exports.sokol = sokol;
exports.test = test;

exports.default = series(libzip, sokol, test);


