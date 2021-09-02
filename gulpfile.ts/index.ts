import { parallel } from "gulp";
import { jsdos } from "./js-dos";
import { emitTypes } from "./types";

exports.default = parallel(jsdos, emitTypes);


