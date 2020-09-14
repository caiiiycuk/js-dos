import { series, parallel } from "gulp";
import { wasm } from "./wasm";
import { emulators } from "./emulators";
import { test } from "./test";

import { emitTypes } from "./types";

exports.default = series(
    wasm,
    parallel(emulators, test, emitTypes),
);

exports.wasm = wasm;


