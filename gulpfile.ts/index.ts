import { series, parallel } from "gulp";
import { jsdos } from "./js-dos";
import { examples } from "./examples";

import { emitTypes } from "./types";

exports.default = series(
    parallel(jsdos, emitTypes),
    examples,
);


