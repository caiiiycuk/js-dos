import { series, parallel } from "gulp";
import { wasm } from "./wasm";
import { emulators } from "./emulators";
import { test } from "./test";

exports.default = series(
    wasm,
    parallel(emulators, test)
);


