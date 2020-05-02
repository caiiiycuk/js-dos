import { series } from "gulp";
import { libzip } from "./libzip";
import { sokol } from "./sokol";
import { direct } from "./direct";
import { worker } from "./worker";
import { jsdos } from "./jsdos";
import { test } from "./test";

exports.libzip = libzip;
exports.sokol = sokol;
exports.test = test;
exports.jsdos = jsdos;

exports.default = series(
    libzip,
    sokol,
    direct,
    worker,
    jsdos,
    test
);


