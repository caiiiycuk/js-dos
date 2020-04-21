import { series } from "gulp";
import { libzip } from "./libzip";
import { sokol } from "./sokol";
import { jsdos } from "./jsdos";
import { test } from "./test";

exports.libzip = libzip;
exports.sokol = sokol;
exports.test = test;
exports.jsdos = jsdos;

exports.default = series(
    libzip,
    sokol,
    jsdos,
    test
);


