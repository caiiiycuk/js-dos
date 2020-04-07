import * as fs from "fs";

import { series } from "gulp";
import { sokol } from "./sokol";
import { test } from "./test";

exports.sokol = sokol;
exports.test = test;

exports.default = series(sokol, test);


