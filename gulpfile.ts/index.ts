import { series, parallel } from "gulp";
import { wasm } from "./wasm";
import { emulators } from "./emulators";
import { test } from "./test";

import { emitTypes } from "./types";
import { updateDosbox } from "./update-dosbox";

exports.default = series(
    wasm,
    parallel(emulators, test, emitTypes),
);

exports.wasm = wasm;
exports.updateDosbox = updateDosbox;


