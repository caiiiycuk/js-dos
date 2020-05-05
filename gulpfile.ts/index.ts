import { series } from "gulp";
import { wasm } from "./wasm";
import { test } from "./test";

exports.default = series(
    wasm,
    test,
);


