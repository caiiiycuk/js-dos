import { parallel } from "gulp";
import { css, js, jsdos } from "./js-dos";
import { emitTypes } from "./types";

exports.default = parallel(jsdos, emitTypes);
exports.jsdos = jsdos;
exports.js = js;
exports.css = css;


